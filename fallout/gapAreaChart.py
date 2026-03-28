from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col,
    lit,
    when,
    count,
    sum as spark_sum,
    round as spark_round,
)
from functools import reduce
import json
import os

spark = SparkSession.builder.appName("HMDA Credit Freeze Analysis").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
data_dir = os.path.join(project_root, "data")

dfs = []
for year in range(2007, 2011):
    path_str = os.path.join(
        data_dir,
        f"hmda_{year}_nationwide_all-records_labels",
        f"hmda_{year}_nationwide_all-records_labels.csv",
    )
    path = f"file:///{path_str.replace(os.path.sep, '/')}"
    print(f"Loading {year}...")
    df = spark.read.csv(path, header=True)
    df = df.withColumn("as_of_year", lit(year))
    dfs.append(df)

print("Unioning DataFrames...")
master_df = reduce(lambda df1, df2: df1.unionByName(df2, allowMissingColumns=True), dfs)

cols_to_keep = [
    "as_of_year",
    "action_taken",
    "loan_type",
    "loan_purpose",
    "lien_status",
    "applicant_income_000s",
    "loan_amount_000s",
]
master_df = master_df.select(*cols_to_keep)

print("Casting Data Types...")
for c in cols_to_keep:
    master_df = master_df.withColumn(c, col(c).cast("double"))

# 1. Base Filters: Remove purchased loans (action_taken=6)
master_df = master_df.filter(col("action_taken") != 6)

master_df = master_df.withColumn(
    "is_originated", when(col("action_taken") == 1, 1).otherwise(0)
).withColumn("is_denied", when(col("action_taken") == 3, 1).otherwise(0))


print("Calculating High Income Thresholds (70th Percentile)...")
q70 = master_df.filter(col("applicant_income_000s").isNotNull()).approxQuantile(
    "applicant_income_000s", [0.70], 0.05
)[0]
print(f"High Income Threshold (70th pct): ${q70:,.0f}k")

master_df = master_df.withColumn(
    "is_high_income", when(col("applicant_income_000s") >= q70, 1).otherwise(0)
)


def compute_metrics(df, segment_name):
    agg_df = (
        df.groupBy("as_of_year")
        .agg(
            count("*").alias("applications"),
            spark_sum("is_originated").alias("originations"),
            spark_sum("is_denied").alias("denials"),
        )
        .withColumn(
            "approval_rate", spark_round(col("originations") / col("applications"), 4)
        )
        .withColumn("denial_rate", spark_round(col("denials") / col("applications"), 4))
        .orderBy("as_of_year")
        .withColumnRenamed("as_of_year", "year")
    )

    rows = [row.asDict() for row in agg_df.collect()]
    return {"segment": segment_name, "data": rows}


results = []

print("Computing Total Market...")
results.append(compute_metrics(master_df, "Total Market"))

print("Computing Segments...")
results.append(compute_metrics(master_df.filter(col("loan_type") == 1), "Conventional"))
results.append(
    compute_metrics(
        master_df.filter(col("loan_type").isin([2, 3, 4])), "Government-backed"
    )
)
results.append(
    compute_metrics(master_df.filter(col("loan_purpose") == 1), "Home Purchase")
)
results.append(compute_metrics(master_df.filter(col("loan_purpose") == 3), "Refinance"))
results.append(compute_metrics(master_df.filter(col("lien_status") == 1), "First Lien"))
results.append(
    compute_metrics(
        master_df.filter(col("is_high_income") == 1), "High-Income Borrowers"
    )
)

# Output JSON
output_dir = os.path.join(script_dir, "output")
os.makedirs(output_dir, exist_ok=True)
out_path = os.path.join(output_dir, "credit_freeze_analysis.json")
with open(out_path, "w") as f:
    json.dump(results, f, indent=2)

print(f"\nAnalysis complete. Results dumped to {out_path}")

for res in results:
    print(f"\n========== {res['segment'].upper()} ==========")
    for r in res["data"]:
        print(
            f"{int(r['year'])} | Apps: {r['applications']:,} | Orig: {r['originations']:,} | Appr Rate: {r['approval_rate']:.2%} | Denial Rate: {r['denial_rate']:.2%}"
        )
