import os
import json
import zipfile
import matplotlib.pyplot as plt
from pyspark.sql import SparkSession
from pyspark.sql.functions import col


def process_refi_data(spark, data_dir, start_year=2010, end_year=2017):
    """
    Eagerly streams ZIPs to calculate the volume of originated refinances
    per year, computing an index baseline relative to 2010 without risking local disk space.
    """
    raw_counts = []

    for year in range(start_year, end_year + 1):
        # We track both strict historical pathing patterns safely
        csv_orig = f"hmda_{year}_nationwide_originated-records_labels.csv"
        csv_all = f"hmda_{year}_nationwide_all-records_labels.csv"

        folder_orig = os.path.join(
            data_dir, f"hmda_{year}_nationwide_originated-records_labels", csv_orig
        )
        folder_all = os.path.join(
            data_dir, f"hmda_{year}_nationwide_all-records_labels", csv_all
        )

        zip_orig = os.path.join(
            data_dir, f"hmda_{year}_nationwide_originated-records_labels.zip"
        )
        zip_all = os.path.join(
            data_dir, f"hmda_{year}_nationwide_all-records_labels.zip"
        )

        temp_csv = os.path.join(data_dir, "temp_refi_processing.csv")
        target_path = None
        extracted = False

        if os.path.exists(folder_orig):
            target_path = folder_orig
        elif os.path.exists(folder_all):
            target_path = folder_all
        elif os.path.exists(os.path.join(data_dir, csv_orig)):
            target_path = os.path.join(data_dir, csv_orig)
        elif os.path.exists(os.path.join(data_dir, csv_all)):
            target_path = os.path.join(data_dir, csv_all)
        elif os.path.exists(zip_orig):
            print(f"[{year}] Unpacking source archive...")
            with zipfile.ZipFile(zip_orig, "r") as zf:
                with zf.open(csv_orig) as src, open(temp_csv, "wb") as tgt:
                    tgt.write(src.read())
            target_path = temp_csv
            extracted = True
        elif os.path.exists(zip_all):
            print(f"[{year}] Unpacking fallback archive...")
            with zipfile.ZipFile(zip_all, "r") as zf:
                with zf.open(csv_all) as src, open(temp_csv, "wb") as tgt:
                    tgt.write(src.read())
            target_path = temp_csv
            extracted = True
        else:
            print(f"Warning: Missing data for {year}. Skipping.")
            continue

        print(f"[{year}] Processing Refinance Volume...")
        path_uri = f"file:///{target_path.replace(os.path.sep, '/')}"

        try:
            df = spark.read.csv(path_uri, header=True)

            # Cast integer keys safely to query
            df = df.withColumn("action_taken", col("action_taken").cast("int"))
            df = df.withColumn("loan_purpose", col("loan_purpose").cast("int"))

            # Logic Rules: Originated (1) + Refinance (3)
            refi_df = df.filter((col("action_taken") == 1) & (col("loan_purpose") == 3))

            count_val = refi_df.count()

            raw_counts.append({"year": year, "refi_count": count_val})
            print(f"[{year}] Originated Refinances: {count_val:,}")

        except Exception as e:
            print(f"[{year}] Pipeline failed: {e}")
        finally:
            if extracted and os.path.exists(temp_csv):
                os.remove(temp_csv)

    # Compile the Index Metric mapped solidly to 2010 counts
    if not raw_counts:
        return []

    baseline = None
    for row in raw_counts:
        if row["year"] == 2010:
            baseline = row["refi_count"]
            break

    if not baseline:
        print(
            "Warning: 2010 baseline not found. Standardizing to first available year."
        )
        baseline = raw_counts[0]["refi_count"]

    results = []
    for row in raw_counts:
        idx = round((row["refi_count"] / baseline) * 100, 1)
        results.append(
            {"year": row["year"], "refi_count": row["refi_count"], "refi_index": idx}
        )

    return results


def save_json(data: list[dict], output_path: str) -> None:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"\nSuccessfully compiled JSON payload: {output_path}")


def plot_chart(data: list[dict], output_img_path: str) -> None:
    """
    Renders an amber-colored area chart exposing the dramatic refinancing wave
    against the 2010 mathematical baseline.
    """
    if not data:
        print("No data supplied for visualizer, skipping chart build.")
        return

    years = [d["year"] for d in data]
    indices = [d["refi_index"] for d in data]

    plt.figure(figsize=(10, 5))

    # Solid Topline and Tinted Underlying Area Base
    plt.plot(years, indices, color="#d97706", linewidth=2, label="Refinance Index")
    plt.fill_between(years, indices, 0, color="#fbbf24", alpha=0.3)

    # Plot formal boundaries for baseline
    plt.axhline(
        y=100, color="gray", linestyle="--", linewidth=1, label="2010 Baseline (100.0)"
    )

    # Auto-detect peak for dramatic annotation payload
    peak_idx = max(indices)
    peak_year = years[indices.index(peak_idx)]

    plt.annotate(
        "Fed rate cuts",
        xy=(peak_year, peak_idx),
        xytext=(peak_year, peak_idx + 15),
        arrowprops=dict(facecolor="black", arrowstyle="->", connectionstyle="arc3"),
        horizontalalignment="center",
        fontweight="bold",
    )

    plt.title("The Refinancing Wave (2010-2017)")
    plt.xlabel("Year")
    plt.ylabel("Refinance Volume Index (2010 = 100)")
    plt.xlim(min(years), max(years))

    # Dynamically scale Y ceiling to let the peak breathe
    plt.ylim(0, max(indices) + 25)

    plt.legend()
    plt.grid(alpha=0.3)

    plt.savefig(output_img_path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"Chart successfully saved to: {output_img_path}")


def main():
    if "SPARK_HOME" in os.environ:
        del os.environ["SPARK_HOME"]

    spark = SparkSession.builder.appName("HMDA_Refi_Wave").getOrCreate()
    spark.sparkContext.setLogLevel("ERROR")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    data_dir = os.path.join(project_root, "data")
    out_json = os.path.join(script_dir, "output", "refi_wave.json")
    out_img = os.path.join(script_dir, "output", "refi_wave_chart.png")

    print(
        f"Initiating PySpark Refinance Indexing Pipeline (2010-2017) from {data_dir}..."
    )
    payload = process_refi_data(spark, data_dir, 2010, 2017)

    # Verification check against expected parameters
    if payload:
        print("\n--- Validation Check ---")
        print(f"Row count (expected 8): {len(payload)}")
        peak = max(payload, key=lambda x: x["refi_index"])
        print(
            f"Peak detected in {peak['year']} (expected 2012-2013) with index {peak['refi_index']}"
        )
        yr2010 = next((r for r in payload if r["year"] == 2010), None)
        if yr2010:
            print(f"2010 baseline metric leveled at exactly: {yr2010['refi_index']}")

    save_json(payload, out_json)
    plot_chart(payload, out_img)


if __name__ == "__main__":
    main()
