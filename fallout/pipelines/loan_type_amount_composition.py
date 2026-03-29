import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import DoubleType, IntegerType

ORIGINATED = 1
CONVENTIONAL = 1
GOVT_BACKED = (2, 3, 4)
MIN_JAVA_MAJOR = 17


def _java_major_version(java_exe: Path) -> int | None:
    try:
        result = subprocess.run(
            [str(java_exe), "-version"],
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
    except (OSError, subprocess.SubprocessError):
        return None

    version_output = "\n".join(part for part in (result.stderr, result.stdout) if part)
    match = re.search(r'version "(\d+)(?:\.\d+)*', version_output)
    return int(match.group(1)) if match else None


def _candidate_java_homes() -> list[Path]:
    java_homes: list[Path] = []

    if os.environ.get("JAVA_HOME"):
        java_homes.append(Path(os.environ["JAVA_HOME"]))

    java_on_path = shutil.which("java")
    if java_on_path:
        java_homes.append(Path(java_on_path).parent.parent)

    for base_dir in (Path(r"C:\Program Files\Eclipse Adoptium"), Path(r"C:\Program Files\Java")):
        if not base_dir.exists():
            continue
        java_homes.extend(path for path in base_dir.iterdir() if path.is_dir())

    unique_homes: list[Path] = []
    seen: set[str] = set()
    for java_home in java_homes:
        normalized = str(java_home).lower()
        if normalized in seen:
            continue
        seen.add(normalized)
        unique_homes.append(java_home)

    return unique_homes


def _resolve_java_home() -> tuple[Path | None, list[str]]:
    probes: list[str] = []
    selected_home: Path | None = None
    selected_major = -1

    for java_home in _candidate_java_homes():
        java_exe = java_home / "bin" / "java.exe"
        if not java_exe.exists():
            probes.append(f"{java_home} (missing bin\\java.exe)")
            continue

        major = _java_major_version(java_exe)
        if major is None:
            probes.append(f"{java_home} (version unknown)")
            continue

        probes.append(f"{java_home} (Java {major})")
        if major >= MIN_JAVA_MAJOR and major > selected_major:
            selected_home = java_home
            selected_major = major

    return selected_home, probes


def configure_local_pyspark_env() -> None:
    os.environ["PYSPARK_PYTHON"] = sys.executable
    os.environ["PYSPARK_DRIVER_PYTHON"] = sys.executable

    if "SPARK_HOME" in os.environ:
        del os.environ["SPARK_HOME"]

    java_home, probes = _resolve_java_home()
    if java_home is None:
        print(f"PySpark requires Java {MIN_JAVA_MAJOR} or newer, but no usable JDK was found.")
        if probes:
            print("Checked these Java locations:")
            for probe in probes:
                print(f"  - {probe}")
        print("Install a JDK 17+ release and set JAVA_HOME to that directory.")
        raise SystemExit(1)

    os.environ["JAVA_HOME"] = str(java_home)
    print(f"Using JAVA_HOME: {java_home}")


def build_spark() -> SparkSession:
    master = os.environ.get("SPARK_MASTER", "local[*]")
    return (
        SparkSession.builder.appName("HMDA_Loan_Type_Amounts")
        .master(master)
        .config("spark.driver.memory", "4g")
        .config("spark.sql.shuffle.partitions", "8")
        .getOrCreate()
    )


def candidate_sources(data_dir: str, year: int) -> list[tuple[str, str, str | None]]:
    prefixes = [
        f"hmda_{year}_nationwide_all-records_labels",
        f"hmda_{year}_nationwide_originated-records_labels",
    ]
    candidates: list[tuple[str, str, str | None]] = []

    for prefix in prefixes:
        csv_name = f"{prefix}.csv"
        candidates.append(("csv", os.path.join(data_dir, csv_name), None))
        candidates.append(("folder", os.path.join(data_dir, prefix, csv_name), None))
        candidates.append(("zip", os.path.join(data_dir, f"{prefix}.zip"), csv_name))

    return candidates


def resolve_source(data_dir: str, year: int) -> tuple[str, str, str | None] | None:
    for kind, path, member_name in candidate_sources(data_dir, year):
        if os.path.exists(path):
            return kind, path, member_name
    return None


def materialize_source(kind: str, path: str, member_name: str | None) -> tuple[str, str | None]:
    if kind in {"csv", "folder"}:
        return path, None

    temp_file = tempfile.NamedTemporaryFile(prefix="hmda_loan_type_amounts_", suffix=".csv", delete=False)
    temp_file.close()

    with zipfile.ZipFile(path, "r") as zip_ref:
        with zip_ref.open(member_name) as source, open(temp_file.name, "wb") as target:
            shutil.copyfileobj(source, target)

    return temp_file.name, temp_file.name


def render_progress(completed: int, total: int, year: int, status: str) -> None:
    bar_width = 28
    filled = int((completed / total) * bar_width) if total > 0 else 0
    bar = "#" * filled + "-" * (bar_width - filled)
    message = f"\r[{bar}] {completed}/{total} years | {year} | {status:<18}"
    print(message, end="", flush=True)
    if completed == total:
        print()


def load_year_df(spark: SparkSession, csv_path: str, year: int):
    needed_cols = [
        "as_of_year",
        "action_taken",
        "loan_type",
        "loan_amount_000s",
    ]

    path_uri = f"file:///{csv_path.replace(os.path.sep, '/')}"

    return (
        spark.read.option("header", "true")
        .option("inferSchema", "false")
        .csv(path_uri)
        .select(needed_cols)
        .withColumn("as_of_year", F.col("as_of_year").cast(IntegerType()))
        .withColumn("action_taken", F.col("action_taken").cast(IntegerType()))
        .withColumn("loan_type", F.col("loan_type").cast(IntegerType()))
        .withColumn("loan_amount_000s", F.col("loan_amount_000s").cast(DoubleType()))
        .filter(F.col("as_of_year") == year)
    )


def compute_year(df, year: int) -> dict:
    filtered = df.filter(
        (F.col("action_taken") == ORIGINATED)
        & (F.col("loan_type").isin(CONVENTIONAL, *GOVT_BACKED))
        & (F.col("loan_type") != 5)
    )

    row = (
        filtered.agg(
            F.count("*").alias("total_count"),
            F.sum(F.when(F.col("loan_type") == CONVENTIONAL, 1).otherwise(0)).alias("conventional_count"),
            F.sum(F.when(F.col("loan_type").isin(*GOVT_BACKED), 1).otherwise(0)).alias("govt_backed_count"),
            F.sum(F.col("loan_amount_000s")).alias("total_amt_000s"),
            F.sum(F.when(F.col("loan_type") == CONVENTIONAL, F.col("loan_amount_000s"))).alias("conventional_amt_000s"),
            F.sum(F.when(F.col("loan_type").isin(*GOVT_BACKED), F.col("loan_amount_000s"))).alias("govt_backed_amt_000s"),
        )
        .collect()[0]
    )

    total_count = int(row["total_count"] or 0)
    conventional_count = int(row["conventional_count"] or 0)
    govt_backed_count = int(row["govt_backed_count"] or 0)

    conventional_pct = round((conventional_count / total_count) * 100, 1) if total_count > 0 else 0.0
    govt_backed_pct = round(100.0 - conventional_pct, 1) if total_count > 0 else 0.0

    conventional_amt_000s = float(row["conventional_amt_000s"] or 0.0)
    govt_backed_amt_000s = float(row["govt_backed_amt_000s"] or 0.0)
    total_amt_000s = float(row["total_amt_000s"] or 0.0)

    conventional_amt_share_pct = round((conventional_amt_000s / total_amt_000s) * 100, 1) if total_amt_000s > 0 else 0.0
    govt_backed_amt_share_pct = round(100.0 - conventional_amt_share_pct, 1) if total_amt_000s > 0 else 0.0

    return {
        "year": year,
        "conventional_pct": conventional_pct,
        "govt_backed_pct": govt_backed_pct,
        "conventional_amt_000s": round(conventional_amt_000s, 2),
        "govt_backed_amt_000s": round(govt_backed_amt_000s, 2),
        "total_amt_000s": round(total_amt_000s, 2),
        "conventional_amt_share_pct": conventional_amt_share_pct,
        "govt_backed_amt_share_pct": govt_backed_amt_share_pct,
    }


def process_years(spark: SparkSession, data_dir: str, start_year: int, end_year: int) -> list[dict]:
    results: list[dict] = []
    total_years = end_year - start_year + 1

    for index, year in enumerate(range(start_year, end_year + 1), start=1):
        source = resolve_source(data_dir, year)
        if source is None:
            render_progress(index, total_years, year, "missing - skipped")
            continue

        csv_path = ""
        temp_path = None

        try:
            render_progress(index - 1, total_years, year, "loading")
            csv_path, temp_path = materialize_source(*source)
            df = load_year_df(spark, csv_path, year)
            results.append(compute_year(df, year))
            render_progress(index, total_years, year, "processed")
        finally:
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)

    return results


def save_json(data: list[dict], output_path: str) -> None:
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2)
    print(f"Saved {len(data)} yearly records to {output_path}")


def default_paths() -> tuple[str, str]:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    fallout_dir = os.path.dirname(script_dir)
    repo_root = os.path.dirname(fallout_dir)
    data_dir = os.path.join(repo_root, "hmda_state", "datasets")
    output_path = os.path.join(fallout_dir, "output", "loan_type_amount_composition.json")
    return data_dir, output_path


def parse_args() -> argparse.Namespace:
    default_data_dir, default_output_path = default_paths()
    parser = argparse.ArgumentParser(description="Compute conventional vs government-backed originated loan amounts by year.")
    parser.add_argument("--data-dir", default=default_data_dir, help="Directory containing the HMDA yearly CSV/ZIP files.")
    parser.add_argument("--start-year", type=int, default=2007, help="First year to process.")
    parser.add_argument("--end-year", type=int, default=2017, help="Last year to process.")
    parser.add_argument("--output", default=default_output_path, help="Output JSON path.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    configure_local_pyspark_env()

    if not os.path.exists(args.data_dir):
        print(f"Dataset directory not found: {args.data_dir}")
        print("This job is configured to read only from hmda_state/datasets.")
        return 1

    spark = build_spark()
    spark.sparkContext.setLogLevel("ERROR")

    try:
        print(f"Reading HMDA data from: {args.data_dir}")
        print(f"Configured year range: {args.start_year} to {args.end_year}")
        payload = process_years(spark, args.data_dir, args.start_year, args.end_year)
        print(f"Processed {len(payload)} year file(s) with available data.")
        save_json(payload, args.output)
        return 0
    finally:
        spark.stop()


if __name__ == "__main__":
    sys.exit(main())
