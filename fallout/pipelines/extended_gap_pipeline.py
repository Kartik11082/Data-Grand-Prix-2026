"""
Chart 3 — Extended Gap Area Chart (Recovery)
Visualizes originated loans 2007–2017 as a gap chart showing credit freeze and recovery.
Highlights:
- Red gap = applications vs originations
- Reference lines: 2009 (floor), 2012 (recovery start)
- Background tint bands: three acts
"""

import os
import json
import zipfile
from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col,
    when,
    sum as spark_sum,
    count,
    round as spark_round,
    lit,
)


def process_gap_chart(spark, data_dir, start_year=2007, end_year=2017):
    """
    Streams through 11 years of HMDA Zips iteratively to calculate Total Applications
    and Total Originations (in millions), saving memory space natively.
    """
    results = []

    for year in range(start_year, end_year + 1):
        zip_path = os.path.join(
            data_dir, f"hmda_{year}_nationwide_originated-records_labels.zip"
        )
        csv_name = f"hmda_{year}_nationwide_originated-records_labels.csv"
        folder_path = os.path.join(
            data_dir, f"hmda_{year}_nationwide_originated-records_labels", csv_name
        )

        # NOTE: A previous script might have used identical zip paths for generic labels.
        # Fallback to the generic all-records zip if originated zip is absent
        fallback_zip = os.path.join(
            data_dir, f"hmda_{year}_nationwide_all-records_labels.zip"
        )
        fallback_csv = f"hmda_{year}_nationwide_all-records_labels.csv"
        fallback_folder = os.path.join(
            data_dir, f"hmda_{year}_nationwide_all-records_labels", fallback_csv
        )

        temp_csv_path = os.path.join(data_dir, "temp_gap_processing.csv")
        target_path = None
        extracted = False

        # Attempt extraction (Checking both specific names you've used historically)
        if os.path.exists(folder_path):
            target_path = folder_path
        elif os.path.exists(fallback_folder):
            target_path = fallback_folder
        elif os.path.exists(os.path.join(data_dir, csv_name)):
            target_path = os.path.join(data_dir, csv_name)
        elif os.path.exists(os.path.join(data_dir, fallback_csv)):
            target_path = os.path.join(data_dir, fallback_csv)
        elif os.path.exists(zip_path):
            print(f"[{year}] Unpacking source archive...")
            with zipfile.ZipFile(zip_path, "r") as zf:
                with zf.open(csv_name) as src, open(temp_csv_path, "wb") as tgt:
                    tgt.write(src.read())
            target_path = temp_csv_path
            extracted = True
        elif os.path.exists(os.path.join(data_dir, fallback_csv)):
            target_path = os.path.join(data_dir, fallback_csv)
        elif os.path.exists(fallback_zip):
            print(f"[{year}] Unpacking fallback archive...")
            with zipfile.ZipFile(fallback_zip, "r") as zf:
                with zf.open(fallback_csv) as src, open(temp_csv_path, "wb") as tgt:
                    tgt.write(src.read())
            target_path = temp_csv_path
            extracted = True
        else:
            print(f"Warning: Missing data for {year}. Skipping.")
            continue

        print(f"[{year}] Processing Payload...")
        path_uri = f"file:///{target_path.replace(os.path.sep, '/')}"

        try:
            df = spark.read.csv(path_uri, header=True)

            # Cast for aggregation
            df = df.withColumn("action_taken", col("action_taken").cast("int"))

            # Calculate the metrics logically matching the frontend required spec:
            # 1. Applications = ALL records excluding Action 6 (purchased loans)
            # 2. Originations = Action 1
            gap_df = df.filter(col("action_taken") != 6)

            agg = gap_df.agg(
                (count("*") / 1_000_000).alias("applications"),
                (
                    spark_sum(when(col("action_taken") == 1, 1).otherwise(0))
                    / 1_000_000
                ).alias("originations"),
            ).collect()[0]

            apps = agg["applications"] or 0
            origs = agg["originations"] or 0

            results.append(
                {
                    "year": year,
                    "applications": round(apps, 2),
                    "originations": round(origs, 2),
                }
            )
            print(f"[{year}] Completed | Apps: {apps:.2f}M | Origs: {origs:.2f}M")

        except Exception as e:
            print(f"[{year}] Pipeline failed: {e}")
        finally:
            if extracted and os.path.exists(temp_csv_path):
                os.remove(temp_csv_path)

    return results


if __name__ == "__main__":
    import os

    if "SPARK_HOME" in os.environ:
        del os.environ["SPARK_HOME"]

    spark = SparkSession.builder.appName("HMDA_Gap_Generator").getOrCreate()
    spark.sparkContext.setLogLevel("ERROR")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    data_dir = os.path.join(project_root, "data")

    # Generate the 2007-2017 payload natively
    print("Initiating full array payload generator (2007-2017)...")
    payload = process_gap_chart(spark, data_dir, 2007, 2017)

    # Export cleanly to gap_chart.json for React frontend
    output_dir = os.path.join(script_dir, "output")
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "gap_chart.json")

    with open(out_path, "w") as f:
        json.dump(payload, f, indent=2)

    print(f"\nSuccessfully compiled fully extended gap chart dataset to: {out_path}")
