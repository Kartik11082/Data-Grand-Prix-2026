import argparse
import json
import os
import shutil
import tempfile
import zipfile

from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import DoubleType, IntegerType

ORIGINATED = 1
CONVENTIONAL = 1
GOVT_BACKED = (2, 3, 4)


def build_spark() -> SparkSession:
    return (
        SparkSession.builder.appName("HMDA_Loan_Type_Amounts")
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

    for year in range(start_year, end_year + 1):
        source = resolve_source(data_dir, year)
        if source is None:
            print(f"[{year}] Missing source file in {data_dir}. Skipping.")
            continue

        csv_path = ""
        temp_path = None

        try:
            csv_path, temp_path = materialize_source(*source)
            print(f"[{year}] Loading {os.path.basename(csv_path)}")
            df = load_year_df(spark, csv_path, year)
            results.append(compute_year(df, year))
            print(f"[{year}] Amount composition computed.")
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

    data_candidates = [
        os.path.join(fallout_dir, "data"),
        os.path.join(repo_root, "hmda_state", "datasets"),
    ]
    data_dir = next((path for path in data_candidates if os.path.exists(path)), data_candidates[0])
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


def main() -> None:
    args = parse_args()
    spark = build_spark()
    spark.sparkContext.setLogLevel("ERROR")

    print(f"Reading HMDA data from: {args.data_dir}")
    payload = process_years(spark, args.data_dir, args.start_year, args.end_year)
    save_json(payload, args.output)


if __name__ == "__main__":
    main()
