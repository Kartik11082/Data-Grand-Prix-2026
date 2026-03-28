import os
import json
from functools import reduce
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when, sum as spark_sum, round as spark_round, lit
import plotly.graph_objects as go


def load_data(spark, data_dir, start_year=2007, end_year=2017):
    """Loads CSV files for multiple years and unions them into a single DataFrame."""
    dfs = []
    # To improve efficiency, we only load the strictly required columns
    columns_to_select = ["as_of_year", "action_taken", "loan_type"]

    for year in range(start_year, end_year + 1):
        path_str = os.path.join(
            data_dir,
            f"hmda_{year}_nationwide_all-records_labels",
            f"hmda_{year}_nationwide_all-records_labels.csv",
        )
        path = f"file:///{path_str.replace(os.path.sep, '/')}"

        try:
            df = spark.read.csv(path, header=True)
            df = df.withColumn("as_of_year", lit(year))

            # Efficiently subset payload
            for col_name in columns_to_select:
                if col_name not in df.columns:
                    df = df.withColumn(col_name, lit(None))

            df = df.select(*columns_to_select)
            dfs.append(df)
            print(f"Loaded year: {year}")
        except Exception:
            print(
                f"Warning: Could not load data for {year}. Please verify it is unzipped."
            )

    if not dfs:
        raise ValueError("No data files were loaded. Check your data directory path.")

    # Union all dataframes efficiently
    master_df = reduce(
        lambda df1, df2: df1.unionByName(df2, allowMissingColumns=True), dfs
    )

    # Cast to double for safe filtering and mathematical aggregations
    for c in columns_to_select:
        master_df = master_df.withColumn(c, col(c).cast("double"))

    return master_df


def process_data(df):
    """Filters data to originated loans and computes conventional vs govt-backed shares per year."""
    # 1. Filter: Originated loans (action_taken=1), exclude loan_type=5
    filtered_df = df.filter((col("action_taken") == 1) & (col("loan_type") != 5))

    # 2. Aggregate counts per year
    agg_df = filtered_df.groupBy("as_of_year").agg(
        spark_sum(when(col("loan_type") == 1, 1).otherwise(0)).alias("conv_count"),
        spark_sum(when(col("loan_type").isin(2, 3, 4), 1).otherwise(0)).alias(
            "govt_count"
        ),
    )

    # 3. Compute percentages summing to 100%
    pct_df = (
        agg_df.withColumn("total", col("conv_count") + col("govt_count"))
        .withColumn(
            "conventional", spark_round((col("conv_count") / col("total")) * 100, 1)
        )
        .withColumn(
            "govt_backed", spark_round((col("govt_count") / col("total")) * 100, 1)
        )
        .select(col("as_of_year").alias("year"), "conventional", "govt_backed")
        .orderBy("year")
    )

    # Return as list of dicts for JSON serialization
    return [row.asDict() for row in pct_df.collect()]


def save_json(data, output_path):
    """Exports the aggregated list of dictionaries to a JSON file."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Data successfully exported to {output_path}")


def plot_chart(json_data):
    """Generates a 100% stacked area chart from the JSON payload using Plotly."""
    years = [row["year"] for row in json_data]
    conventional = [row["conventional"] for row in json_data]
    govt_backed = [row["govt_backed"] for row in json_data]

    fig = go.Figure()

    # Conventional (Bottom band)
    fig.add_trace(
        go.Scatter(
            x=years,
            y=conventional,
            mode="lines",
            name="Conventional",
            line=dict(width=0),
            fill="tozeroy",
            fillcolor="#378ADD",  # Blue
            stackgroup="one",
        )
    )

    # Government Backed (Top band)
    fig.add_trace(
        go.Scatter(
            x=years,
            y=govt_backed,
            mode="lines",
            name="Govt-Backed (FHA/VA/FSA)",
            line=dict(width=0),
            fill="tonexty",
            fillcolor="#639922",  # Green
            stackgroup="one",
        )
    )

    # Layout Configuration
    fig.update_layout(
        title="Originated Loans Composition (2007–2017)",
        xaxis_title="Year",
        yaxis_title="Percent of Originated Loans (%)",
        yaxis=dict(ticksuffix="%", range=[0, 100]),
        xaxis=dict(tickmode="linear", dtick=1),
        hovermode="x unified",
        template="plotly_dark",
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1,
            bgcolor="rgba(0,0,0,0.5)",
        ),
    )

    fig.show()


def main():
    # Setup Spark (silencing memory warnings heavily)
    spark = SparkSession.builder.appName("HMDA_Composition").getOrCreate()
    spark.sparkContext.setLogLevel("ERROR")

    # Dynamic Path Resolutions
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    data_dir = os.path.join(project_root, "data")
    output_file = os.path.join(script_dir, "output", "loan_type_composition.json")

    print(f"Initializing data load from: {data_dir}")

    # 1. Load Data
    master_df = load_data(spark, data_dir, start_year=2007, end_year=2017)

    # 2. Process Data
    print("Aggregating percentages (this may take a minute based on disk mapping)...")
    json_data = process_data(master_df)

    # 3. Save Output
    save_json(json_data, output_file)

    # 4. Visualize
    print("Rendering 100% Stacked Area Chart...")
    plot_chart(json_data)

    print("Pipeline Complete.")


if __name__ == "__main__":
    main()
