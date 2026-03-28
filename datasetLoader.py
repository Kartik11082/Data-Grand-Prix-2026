from pyspark.sql import SparkSession

# Initialize Spark session
spark = SparkSession.builder.appName("HMDA2017Loader").getOrCreate()

# Path to your CSV file
csv_file_path = "C:\\Users\\karke\\OneDrive\\Desktop\\projects\\DataGrandPrix\\data\\hmda_2017_nationwide_all-records_labels.csv"

# Load CSV into DataFrame
hmda_df = spark.read.csv(
    csv_file_path,
    header=True,  # First row has column names
    inferSchema=True,  # Automatically infer data types
)

# Show the first few rows
hmda_df.show(5)

# Print schema to check data types
hmda_df.printSchema()
