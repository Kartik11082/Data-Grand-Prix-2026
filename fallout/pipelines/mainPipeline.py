"""
HMDA Incremental Aggregation Pipeline
======================================
Process one year at a time. Load raw file → compute summaries →
merge into cumulative state → save → delete raw file.

Run once per year as you download each file:
    python hmda_pipeline.py --year 2007 --file path/to/hmda_2007_nationwide.csv

Or run all years sequentially if you have disk space:
    for year in range(2007, 2018):
        python hmda_pipeline.py --year {year} --file path/to/hmda_{year}_nationwide.csv
"""

import argparse
import json
import os
from pathlib import Path

from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import IntegerType, DoubleType

# ─── CONFIG ───────────────────────────────────────────────────────────────────

STATE_DIR = Path("./hmda_state")  # persisted cumulative outputs live here
RAW_CACHE = Path("./hmda_raw_cache")  # optional: where raw files are stored

# FIPS → state abbreviation lookup
FIPS_TO_ABBR = {
    "01": "AL",
    "02": "AK",
    "04": "AZ",
    "05": "AR",
    "06": "CA",
    "08": "CO",
    "09": "CT",
    "10": "DE",
    "11": "DC",
    "12": "FL",
    "13": "GA",
    "15": "HI",
    "16": "ID",
    "17": "IL",
    "18": "IN",
    "19": "IA",
    "20": "KS",
    "21": "KY",
    "22": "LA",
    "23": "ME",
    "24": "MD",
    "25": "MA",
    "26": "MI",
    "27": "MN",
    "28": "MS",
    "29": "MO",
    "30": "MT",
    "31": "NE",
    "32": "NV",
    "33": "NH",
    "34": "NJ",
    "35": "NM",
    "36": "NY",
    "37": "NC",
    "38": "ND",
    "39": "OH",
    "40": "OK",
    "41": "OR",
    "42": "PA",
    "44": "RI",
    "45": "SC",
    "46": "SD",
    "47": "TN",
    "48": "TX",
    "49": "UT",
    "50": "VT",
    "51": "VA",
    "53": "WA",
    "54": "WV",
    "55": "WI",
    "56": "WY",
}

# action_taken codes
ORIGINATED = 1
DENIED = 3

# loan_type codes
CONV, FHA, VA, FSA = 1, 2, 3, 4

# loan_purpose codes
PURCHASE, IMPROVEMENT, REFI = 1, 2, 3

# ─── SPARK SESSION ────────────────────────────────────────────────────────────


def get_spark():
    return (
        SparkSession.builder.appName("HMDA_Incremental")
        .config("spark.driver.memory", "4g")
        .config("spark.sql.shuffle.partitions", "8")  # keep low for local
        .getOrCreate()
    )


# ─── LOAD RAW FILE ────────────────────────────────────────────────────────────


def load_year(spark, filepath: str, year: int):
    """
    Load one year's HMDA raw CSV.
    Selects only the columns we need — keeps memory footprint minimal.
    """
    needed_cols = [
        "as_of_year",
        "action_taken",
        "loan_type",
        "loan_purpose",
        "state_code",
        "applicant_income_000s",
    ]

    df = (
        spark.read.option("header", "true")
        .option("inferSchema", "false")  # read everything as string first
        .csv(filepath)
        .select(needed_cols)
        # cast to numeric — coerce bad strings to null
        .withColumn("as_of_year", F.col("as_of_year").cast(IntegerType()))
        .withColumn("action_taken", F.col("action_taken").cast(IntegerType()))
        .withColumn("loan_type", F.col("loan_type").cast(IntegerType()))
        .withColumn("loan_purpose", F.col("loan_purpose").cast(IntegerType()))
        .withColumn("state_code", F.col("state_code").cast(IntegerType()))
        .withColumn(
            "applicant_income_000s", F.col("applicant_income_000s").cast(DoubleType())
        )
        # keep only the year we expect — guards against multi-year files
        .filter(F.col("as_of_year") == year)
    )
    return df


# ─── Q1: APPLICATIONS vs ORIGINATIONS ─────────────────────────────────────────
# Output: { year -> { applications, originations } }
# Math:
#   Exclude action_taken = 6 (purchased loans — inter-institution transfers)
#   applications  = COUNT(*) on remaining rows
#   originations  = COUNT(*) WHERE action_taken = 1
#   denial_count  = COUNT(*) WHERE action_taken = 3
#   origination_rate = originations / applications


def compute_q1(df, year: int) -> dict:
    # Purchased loans (code 6) are transfers, not borrower applications
    filtered = df.filter(F.col("action_taken") != 6)
    row = filtered.agg(
        F.count("*").alias("applications"),
        F.sum(F.when(F.col("action_taken") == ORIGINATED, 1).otherwise(0)).alias(
            "originations"
        ),
        F.sum(F.when(F.col("action_taken") == DENIED, 1).otherwise(0)).alias("denials"),
    ).collect()[0]
    apps = int(row["applications"] or 0)
    origs = int(row["originations"] or 0)
    denials = int(row["denials"] or 0)
    return {
        "applications": apps,
        "originations": origs,
        "denials": denials,
        "origination_rate": round(origs / apps, 4) if apps > 0 else None,
        "denial_rate": round(denials / apps, 4) if apps > 0 else None,
    }


# ─── Q2: LOAN TYPE COMPOSITION ────────────────────────────────────────────────
# Output: { year -> { conventional_n, fha_n, va_n, fsa_n, total_n,
#                     conventional_pct, fha_pct, va_pct, fsa_pct } }
# Math:
#   Filter: action_taken = 1 (originated only)
#   count_k = COUNT(*) WHERE loan_type = k
#   share_k = count_k / SUM(all k) * 100


def compute_q2(df, year: int) -> dict:
    row = (
        df.filter(F.col("action_taken") == ORIGINATED)
        .agg(
            F.count("*").alias("total"),
            F.sum(F.when(F.col("loan_type") == CONV, 1).otherwise(0)).alias(
                "conventional"
            ),
            F.sum(F.when(F.col("loan_type") == FHA, 1).otherwise(0)).alias("fha"),
            F.sum(F.when(F.col("loan_type") == VA, 1).otherwise(0)).alias("va"),
            F.sum(F.when(F.col("loan_type") == FSA, 1).otherwise(0)).alias("fsa"),
        )
        .collect()[0]
    )
    total = int(row["total"]) or 1
    conv = int(row["conventional"])
    fha = int(row["fha"])
    va = int(row["va"])
    fsa = int(row["fsa"])
    return {
        "total_originations": total,
        "conventional_n": conv,
        "fha_n": fha,
        "va_n": va,
        "fsa_n": fsa,
        "conventional_pct": round(conv / total * 100, 2),
        "fha_pct": round(fha / total * 100, 2),
        "va_pct": round(va / total * 100, 2),
        "fsa_pct": round(fsa / total * 100, 2),
    }


# ─── Q3: REFINANCING WAVE ─────────────────────────────────────────────────────
# Output: { year -> { total_originations, refi_originations, refi_share_pct } }
# Math:
#   Filter: action_taken = 1
#   total = COUNT(*)
#   refi  = COUNT(*) WHERE loan_purpose = 3
#   refi_share = refi / total * 100


def compute_q3(df, year: int) -> dict:
    row = (
        df.filter(F.col("action_taken") == ORIGINATED)
        .agg(
            F.count("*").alias("total"),
            F.sum(F.when(F.col("loan_purpose") == REFI, 1).otherwise(0)).alias("refi"),
            F.sum(F.when(F.col("loan_purpose") == PURCHASE, 1).otherwise(0)).alias(
                "purchase"
            ),
            F.sum(F.when(F.col("loan_purpose") == IMPROVEMENT, 1).otherwise(0)).alias(
                "improvement"
            ),
        )
        .collect()[0]
    )
    total = int(row["total"]) or 1
    refi = int(row["refi"])
    purchase = int(row["purchase"])
    return {
        "total_originations": total,
        "refi_n": refi,
        "purchase_n": purchase,
        "improvement_n": int(row["improvement"]),
        "refi_share_pct": round(refi / total * 100, 2),
        "purchase_share_pct": round(purchase / total * 100, 2),
    }


# ─── Q4: BORROWER PROFILE ─────────────────────────────────────────────────────
# Output: { year -> { median_income, approval_rate, denial_rate,
#                     dominant_purpose, dominant_loan_type } }
# Math:
#   median_income  = PERCENTILE_APPROX(income, 0.5) on approved loans, non-null income
#   approval_rate  = COUNT(action_taken=1) / COUNT(*)
#   denial_rate    = COUNT(action_taken=3) / COUNT(*)
#   dominant_purpose   = loan_purpose with MAX count among originated
#   dominant_loan_type = loan_type    with MAX count among originated


def compute_q4(df, year: int) -> dict:
    # approval / denial rates over ALL applications
    rates_row = df.agg(
        F.count("*").alias("total"),
        F.sum(F.when(F.col("action_taken") == ORIGINATED, 1).otherwise(0)).alias(
            "approved"
        ),
        F.sum(F.when(F.col("action_taken") == DENIED, 1).otherwise(0)).alias("denied"),
    ).collect()[0]
    total = int(rates_row["total"]) or 1
    approved = int(rates_row["approved"])

    # median income on approved + non-null income
    income_row = (
        df.filter(
            (F.col("action_taken") == ORIGINATED)
            & F.col("applicant_income_000s").isNotNull()
            & (F.col("applicant_income_000s") > 0)
            & (
                F.col("applicant_income_000s") < 9999
            )  # HMDA uses 9999 as sentinel for NA
        )
        .agg(F.percentile_approx("applicant_income_000s", 0.5).alias("median_income_k"))
        .collect()[0]
    )

    # dominant loan purpose (mode) among originated
    purpose_row = (
        df.filter(F.col("action_taken") == ORIGINATED)
        .groupBy("loan_purpose")
        .count()
        .orderBy(F.col("count").desc())
        .first()
    )

    # dominant loan type (mode) among originated
    type_row = (
        df.filter(F.col("action_taken") == ORIGINATED)
        .groupBy("loan_type")
        .count()
        .orderBy(F.col("count").desc())
        .first()
    )

    purpose_map = {1: "Purchase", 2: "Improvement", 3: "Refinancing"}
    type_map = {1: "Conventional", 2: "FHA", 3: "VA", 4: "FSA/RHS"}

    return {
        "approval_rate_pct": round(approved / total * 100, 2),
        "denial_rate_pct": round(int(rates_row["denied"]) / total * 100, 2),
        "median_income_k": float(income_row["median_income_k"])
        if income_row["median_income_k"]
        else None,
        "dominant_purpose_code": int(purpose_row["loan_purpose"])
        if purpose_row
        else None,
        "dominant_purpose": purpose_map.get(int(purpose_row["loan_purpose"]), "Unknown")
        if purpose_row
        else None,
        "dominant_loan_type_code": int(type_row["loan_type"]) if type_row else None,
        "dominant_loan_type": type_map.get(int(type_row["loan_type"]), "Unknown")
        if type_row
        else None,
    }


# ─── Q5: STATE VOLUMES ────────────────────────────────────────────────────────
# Output: { year -> { state_abbr -> count } }
# Math:
#   Filter: action_taken = 1
#   GROUP BY state_code
#   vol = COUNT(*)
#   recovery_index computed AFTER all years loaded: vol_2017 / vol_2007


def compute_q5(df, year: int) -> dict:
    rows = (
        df.filter(F.col("action_taken") == ORIGINATED)
        .groupBy("state_code")
        .agg(F.count("*").alias("vol"))
        .collect()
    )
    result = {}
    for row in rows:
        try:
            sc = str(int(row["state_code"])).zfill(2) if row["state_code"] else None
        except (ValueError, TypeError):
            continue
        abbr = FIPS_TO_ABBR.get(sc)
        if abbr:
            result[abbr] = int(row["vol"])
    return result


# ─── STATE MANAGEMENT ─────────────────────────────────────────────────────────
# Cumulative state is a JSON file on disk.
# Structure:
# {
#   "q1": { "2007": {...}, "2008": {...}, ... },
#   "q2": { "2007": {...}, ... },
#   "q3": { "2007": {...}, ... },
#   "q4": { "2007": {...}, ... },
#   "q5": { "2007": { "CA": 580000, ... }, ... },
#   "years_processed": [2007, 2008, ...]
# }

STATE_FILE = STATE_DIR / "cumulative_state.json"


def load_state() -> dict:
    STATE_DIR.mkdir(exist_ok=True)
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            return json.load(f)
    return {"q1": {}, "q2": {}, "q3": {}, "q4": {}, "q5": {}, "years_processed": []}


def save_state(state: dict):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)
    print(f"  ✓ State saved → {STATE_FILE}")


def export_frontend_json(state: dict):
    """
    Derive frontend-ready JSON files that match the exact contract
    the FastAPI app.py and React frontend expect.

    Writes directly to fallout/output/ so the API serves fresh data.
    """
    # Write to fallout/output/ — where app.py reads from
    script_dir = Path(__file__).resolve().parent
    out_dir = script_dir.parent / "output"
    out_dir.mkdir(exist_ok=True)

    # Also keep a copy in state dir for safety
    state_out = STATE_DIR / "frontend"
    state_out.mkdir(exist_ok=True)

    years = sorted(int(y) for y in state["years_processed"])

    # ── gap_chart.json ──
    # Frontend expects: [{"year": 2007, "applications": 6.82, "originations": 5.74}, ...]
    # Values in MILLIONS (divide raw counts by 1_000_000)
    gap_chart = []
    for y in years:
        q1 = state["q1"].get(str(y), {})
        apps_raw = q1.get("applications", 0)
        origs_raw = q1.get("originations", 0)
        gap_chart.append(
            {
                "year": y,
                "applications": round(apps_raw / 1_000_000, 2),
                "originations": round(origs_raw / 1_000_000, 2),
            }
        )
    for target in [out_dir / "gap_chart.json", state_out / "gap_chart.json"]:
        with open(target, "w") as f:
            json.dump(gap_chart, f, indent=2)

    # ── loan_type_composition.json ──
    # Frontend expects: [{"year": 2007, "conventional": 88.0, "govt_backed": 12.0}, ...]
    loan_comp = []
    for y in years:
        q2 = state["q2"].get(str(y), {})
        conv_pct = q2.get("conventional_pct", 0)
        govt_pct = round(
            q2.get("fha_pct", 0) + q2.get("va_pct", 0) + q2.get("fsa_pct", 0), 1
        )
        # Ensure they sum to 100
        conv_pct = round(100.0 - govt_pct, 1)
        loan_comp.append(
            {
                "year": y,
                "conventional": conv_pct,
                "govt_backed": govt_pct,
            }
        )
    for target in [
        out_dir / "loan_type_composition.json",
        state_out / "loan_type_composition.json",
    ]:
        with open(target, "w") as f:
            json.dump(loan_comp, f, indent=2)

    # ── refi_wave.json ──
    # Frontend expects: [{"year": 2010, "refi_index": 100}, ...]
    # Index: refi volume relative to 2010 baseline (2010 = 100)
    # Only export once 2010 baseline exists — otherwise index values are meaningless
    refi_wave = []
    if "2010" in state["q3"]:
        refi_years = [y for y in years if y >= 2010]
        baseline_refi = state["q3"]["2010"].get("refi_n", 1) or 1
        for y in refi_years:
            q3 = state["q3"].get(str(y), {})
            refi_n = q3.get("refi_n", 0)
            refi_wave.append(
                {
                    "year": y,
                    "refi_index": round(refi_n / baseline_refi * 100, 1),
                }
            )
    for target in [out_dir / "refi_wave.json", state_out / "refi_wave.json"]:
        with open(target, "w") as f:
            json.dump(refi_wave, f, indent=2)

    # ── borrower_profiles.json (extra — for Behavior Shift page) ──
    profiles = {}
    for y in [2007, max(years)]:
        ys = str(y)
        if ys in state["q4"]:
            profiles[ys] = state["q4"][ys]
    for target in [state_out / "borrower_profiles.json"]:
        with open(target, "w") as f:
            json.dump(profiles, f, indent=2)

    # ── state_volumes.json (extra — for Geography column) ──
    vol_2007 = state["q5"].get("2007", {})
    latest_year = str(max(years))
    vol_latest = state["q5"].get(latest_year, {})
    all_states = set(vol_2007.keys()) | set(vol_latest.keys())
    state_data = []
    for abbr in sorted(all_states):
        v07 = vol_2007.get(abbr)
        vlt = vol_latest.get(abbr)
        ri = round(vlt / v07, 4) if (v07 and vlt and v07 > 0) else None
        state_data.append(
            {
                "state_abbr": abbr,
                "vol_2007": v07,
                f"vol_{latest_year}": vlt,
                "recovery_index": ri,
            }
        )
    for target in [state_out / "state_volumes.json"]:
        with open(target, "w") as f:
            json.dump(state_data, f, indent=2)

    print(f"\n  ✓ Frontend JSON exported → {out_dir}/")
    print(f"    gap_chart.json               ({len(gap_chart)} years)")
    print(f"    loan_type_composition.json    ({len(loan_comp)} years)")
    print(f"    refi_wave.json               ({len(refi_wave)} years)")
    print(f"  ✓ Extra data → {state_out}/")
    print(f"    borrower_profiles.json        ({len(profiles)} profiles)")
    print(f"    state_volumes.json            ({len(state_data)} states)")


# ─── MAIN ─────────────────────────────────────────────────────────────────────


def process_year(year: int, filepath: str, delete_after: bool = False):
    print(f"\n{'=' * 54}")
    print(f"  Processing year: {year}")
    print(f"  File: {filepath}")
    print(f"{'=' * 54}")

    # Guard: don't reprocess
    state = load_state()
    if year in state["years_processed"]:
        print(f"  ⚠  Year {year} already processed. Skipping.")
        print(f"     Delete entry from years_processed in {STATE_FILE} to rerun.")
        return

    spark = get_spark()

    print(f"\n  Loading raw data...")
    df = load_year(spark, filepath, year)

    # Cache in memory — we hit this DataFrame 5 times below
    df.cache()
    total_rows = df.count()
    print(f"  Rows loaded for {year}: {total_rows:,}")

    if total_rows == 0:
        print(f"  ✗ ERROR: 0 rows found for year {year}.")
        print(f"    Check that --year matches the file's as_of_year column.")
        print(
            f"    You passed --year {year} but the file may contain a different year."
        )
        df.unpersist()
        return

    ys = str(year)

    print(f"  Running Q1 (applications vs originations)...")
    state["q1"][ys] = compute_q1(df, year)
    print(f"    origination_rate = {state['q1'][ys]['origination_rate']}")

    print(f"  Running Q2 (loan type composition)...")
    state["q2"][ys] = compute_q2(df, year)
    print(f"    conventional_pct = {state['q2'][ys]['conventional_pct']}%")

    print(f"  Running Q3 (refinancing wave)...")
    state["q3"][ys] = compute_q3(df, year)
    print(f"    refi_share_pct   = {state['q3'][ys]['refi_share_pct']}%")

    print(f"  Running Q4 (borrower profile)...")
    state["q4"][ys] = compute_q4(df, year)
    print(f"    median_income_k  = {state['q4'][ys]['median_income_k']}")
    print(f"    approval_rate    = {state['q4'][ys]['approval_rate_pct']}%")

    print(f"  Running Q5 (state volumes)...")
    state["q5"][ys] = compute_q5(df, year)
    print(f"    states found     = {len(state['q5'][ys])}")

    df.unpersist()

    # Mark as processed and persist
    state["years_processed"].append(year)
    save_state(state)

    # Export updated frontend JSON on every run
    export_frontend_json(state)

    # Optionally delete the raw file to free disk
    if delete_after:
        os.remove(filepath)
        print(f"\n  ✓ Raw file deleted: {filepath}")

    print(
        f"\n  Done with {year}. Years processed so far: {sorted(state['years_processed'])}"
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="HMDA Incremental Aggregation Pipeline"
    )
    parser.add_argument("--year", type=int, required=True, help="e.g. 2007")
    parser.add_argument("--file", type=str, required=True, help="path to raw HMDA CSV")
    parser.add_argument(
        "--delete", action="store_true", help="delete raw file after processing"
    )
    args = parser.parse_args()

    process_year(year=args.year, filepath=args.file, delete_after=args.delete)
