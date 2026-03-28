import os
import json
from functools import reduce
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when, sum as spark_sum, round as spark_round, lit


def process_pipeline(spark, data_dir, start_year=2007, end_year=2017):
    """
    Iterates through zipped HMDA archives, unzipping and aggregating exactly ONE year at a time
    to prevent overwhelming local disk space. Deletes the extracted CSV immediately after calculation.
    """
    import zipfile

    results = []

    for year in range(start_year, end_year + 1):
        # hmda_2007_nationwide_originated-records_labels
        zip_path = os.path.join(
            data_dir, f"hmda_{year}_nationwide_originated-records_labels.zip"
        )
        csv_name = f"hmda_{year}_nationwide_originated-records_labels.csv"

        # Check folder fallback if zip isn't there
        folder_path = os.path.join(
            data_dir, f"hmda_{year}_nationwide_originated-records_labels", csv_name
        )
        temp_csv_path = os.path.join(data_dir, "temp_processing.csv")

        target_path = None
        extracted = False

        if os.path.exists(folder_path):
            target_path = folder_path
        elif os.path.exists(zip_path):
            print(f"[{year}] Unzipping 10GB archive temporarily...")
            with zipfile.ZipFile(zip_path, "r") as zip_ref:
                # Extract the single giant CSV as our safe temp file
                with (
                    zip_ref.open(csv_name) as source,
                    open(temp_csv_path, "wb") as target,
                ):
                    target.write(source.read())
            target_path = temp_csv_path
            extracted = True
        else:
            print(f"Warning: Could not find {year} data.")
            continue

        print(f"[{year}] Loading PySpark DataFrame...")
        path_uri = f"file:///{target_path.replace(os.path.sep, '/')}"

        try:
            df = spark.read.csv(path_uri, header=True)
            df = df.withColumn("as_of_year", lit(year))

            # Cast and explicitly filter right away
            df = df.withColumn("action_taken", col("action_taken").cast("int"))
            df = df.withColumn("loan_type", col("loan_type").cast("int"))

            filtered_df = df.filter(
                (col("action_taken") == 1) & (col("loan_type") != 5)
            )

            # Eagerly aggregate this year alone down to 1 row
            agg_row = filtered_df.agg(
                spark_sum(when(col("loan_type") == 1, 1).otherwise(0)).alias(
                    "conv_count"
                ),
                spark_sum(when(col("loan_type").isin(2, 3, 4), 1).otherwise(0)).alias(
                    "govt_count"
                ),
            ).collect()[0]

            conv = agg_row["conv_count"] or 0
            govt = agg_row["govt_count"] or 0
            total = conv + govt

            if total > 0:
                results.append(
                    {
                        "year": year,
                        "conventional": round((conv / total) * 100, 1),
                        "govt_backed": round((govt / total) * 100, 1),
                    }
                )
            print(f"[{year}] Compilation successful. Freeing disk space.")

        except Exception as e:
            print(f"Failed to process {year}: {e}")

        finally:
            if extracted and os.path.exists(temp_csv_path):
                os.remove(temp_csv_path)

    return results


def save_json(data, output_path):
    """Exports the aggregated list of dictionaries to a JSON file."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Data successfully exported to {output_path}")

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
    import os

    if "SPARK_HOME" in os.environ:
        del os.environ["SPARK_HOME"]

    spark = SparkSession.builder.appName("HMDA_Composition").getOrCreate()
    spark.sparkContext.setLogLevel("ERROR")

    # Dynamic Path Resolutions
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    data_dir = os.path.join(project_root, "data")
    output_file = os.path.join(script_dir, "../output", "loan_type_composition.json")

    print(f"Initializing stream extraction pipeline from: {data_dir}")

    # Process Data Year-over-Year (Eager garbage collection)
    print("Aggregating percentages (unzipping datasets dynamically)...")
    json_data = process_pipeline(spark, data_dir, start_year=2007, end_year=2017)

    # 3. Save Output
    save_json(json_data, output_file)

    # 4. Visualize
    print("Rendering 100% Stacked Area Chart...")

    print("Pipeline Complete.")


if __name__ == "__main__":
    main()
