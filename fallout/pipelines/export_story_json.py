"""
Story Endpoint JSON Exporter
=============================
Reads cumulative_state.json produced by mainPipeline.py and derives
the five story-endpoint JSON files the frontend expects.

Output files (written to fallout/output/story/):
  story_landing.json
  story_collapse.json
  story_recovery.json
  story_behavior_shift.json
  story_summary.json

Usage:
  python export_story_json.py
"""

import json
from pathlib import Path
from typing import Any

# ── paths ──────────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).resolve().parent
STATE_FILE = SCRIPT_DIR.parent.parent / "hmda_state" / "cumulative_state.json"
OUTPUT_DIR = SCRIPT_DIR.parent / "output" / "story"

# FIPS abbreviations → full state names (for geography display)
ABBR_TO_NAME: dict[str, str] = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District of Columbia",
    "FL": "Florida",
    "GA": "Georgia",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PA": "Pennsylvania",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming",
}


# ── helpers ────────────────────────────────────────────────────────────────────


def load_state() -> dict[str, Any]:
    with open(STATE_FILE) as f:
        return json.load(f)


def save_json(filename: str, data: Any) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUTPUT_DIR / filename
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"  OK {path}")


def fmt_millions(n: int) -> str:
    """Format raw count as human-readable millions string: 10441545 → '10.4M'"""
    m = n / 1_000_000
    if m >= 1:
        return f"{m:.1f}M"
    return f"{int(n / 1000)}K"


def approval_rate_pct(q1: dict) -> float:
    """origination_rate as a percentage rounded to nearest int."""
    return round(q1["origination_rate"] * 100)


def recovery_index(vol_2007: dict, vol_2017: dict, abbr: str) -> float | None:
    v07 = vol_2007.get(abbr)
    v17 = vol_2017.get(abbr)
    if v07 and v17 and v07 > 0:
        return round(v17 / v07, 2)
    return None


def bucket_for_recovery(ri: float | None) -> str:
    if ri is None:
        return "medium"
    if ri >= 1.0:
        return "high"
    if ri >= 0.8:
        return "medium"
    return "low"


def bucket_for_volume(vol: int, p75: float, p25: float) -> str:
    if vol >= p75:
        return "high"
    if vol >= p25:
        return "medium"
    return "low"


def quantile_threshold(values: list[float], q: float) -> float:
    """Return a simple nearest-rank quantile threshold from a numeric list."""
    if not values:
        return 0.0
    ordered = sorted(values)
    idx = int(round((len(ordered) - 1) * q))
    idx = max(0, min(idx, len(ordered) - 1))
    return float(ordered[idx])


def bucket_from_terciles(value: float, low_cut: float, high_cut: float) -> str:
    """Bucket a numeric value into low/medium/high based on tercile thresholds."""
    if value >= high_cut:
        return "high"
    if value >= low_cut:
        return "medium"
    return "low"


def pct_of_baseline(ri: float) -> str:
    """Format recovery index as percent of 2007 baseline, e.g. 0.99 -> '99%'."""
    return f"{round(ri * 100)}%"


def signed_pct(delta: float) -> str:
    """Format a signed percentage delta, e.g. -1.2 -> '-1%'."""
    rounded = round(delta)
    sign = "+" if rounded >= 0 else ""
    return f"{sign}{rounded}%"


def build_originations_metric(volumes_by_state: dict[str, int]) -> dict:
    """Build a map payload for originations volume by state."""
    sorted_states = sorted(volumes_by_state.items(), key=lambda item: item[1], reverse=True)
    if not sorted_states:
        return {"title": "Originations volume by state", "states": [], "top_states": [], "bottom_states": []}

    values = [float(volume) for _, volume in sorted_states]
    low_cut = quantile_threshold(values, 0.33)
    high_cut = quantile_threshold(values, 0.67)

    states = [
        {
            "state": ABBR_TO_NAME.get(abbr, abbr),
            "abbr": abbr,
            "value": fmt_millions(volume),
            "raw_value": volume,
            "bucket": bucket_from_terciles(float(volume), low_cut, high_cut),
        }
        for abbr, volume in sorted_states
    ]

    top_states = [{"state": abbr, "abbr": abbr, "value": fmt_millions(volume)} for abbr, volume in sorted_states[:3]]
    bottom_states = [{"state": abbr, "abbr": abbr, "value": fmt_millions(volume)} for abbr, volume in sorted_states[-3:]]

    return {
        "title": "Originations volume by state",
        "states": states,
        "top_states": top_states,
        "bottom_states": bottom_states,
    }


def build_recovery_metric(vol_2007: dict[str, int], volumes_by_state: dict[str, int]) -> dict:
    """Build a map payload for recovery index by state relative to 2007."""
    recovery_items: list[tuple[str, float]] = []
    for abbr in set(vol_2007.keys()) & set(volumes_by_state.keys()):
        base_volume = vol_2007.get(abbr, 0)
        year_volume = volumes_by_state.get(abbr, 0)
        if base_volume and year_volume and base_volume > 0:
            recovery_items.append((abbr, year_volume / base_volume))

    recovery_items.sort(key=lambda item: item[1], reverse=True)

    if not recovery_items:
        return {"title": "Recovery index vs 2007 baseline", "states": [], "top_states": [], "bottom_states": []}

    values = [ratio for _, ratio in recovery_items]
    low_cut = quantile_threshold(values, 0.33)
    high_cut = quantile_threshold(values, 0.67)

    states = [
        {
            "state": ABBR_TO_NAME.get(abbr, abbr),
            "abbr": abbr,
            "value": pct_of_baseline(ratio),
            "raw_value": round(ratio, 4),
            "bucket": bucket_from_terciles(ratio, low_cut, high_cut),
        }
        for abbr, ratio in recovery_items
    ]

    top_states = [
        {"state": abbr, "abbr": abbr, "value": signed_pct((ratio - 1) * 100)}
        for abbr, ratio in recovery_items[:3]
    ]
    bottom_states = [
        {"state": abbr, "abbr": abbr, "value": signed_pct((ratio - 1) * 100)}
        for abbr, ratio in recovery_items[-3:]
    ]

    return {
        "title": "Recovery index vs 2007 baseline",
        "states": states,
        "top_states": top_states,
        "bottom_states": bottom_states,
    }


# ── 1. /story/landing ─────────────────────────────────────────────────────────


def build_landing(state: dict) -> dict:
    q1 = state["q1"]
    years = sorted(q1.keys())
    total_records = sum(state["q1"][y]["applications"] for y in years)

    # Hero metric: drop in approval rate from peak to floor
    approval_2007 = approval_rate_pct(q1["2007"])
    approval_2009 = approval_rate_pct(q1["2009"])
    # Find the year with the lowest origination rate in 2008-2010 range
    floor_year = min(
        ["2008", "2009", "2010"],
        key=lambda y: q1[y]["origination_rate"],
    )
    approval_floor = approval_rate_pct(q1[floor_year])

    # Find the year with the highest origination rate as the peak
    peak_year = max(years, key=lambda y: q1[y]["origination_rate"])
    approval_peak = approval_rate_pct(q1[peak_year])

    drop_pp = approval_peak - approval_floor

    # Peak applications year
    app_peak_year = max(years, key=lambda y: q1[y]["applications"])
    app_peak_val = q1[app_peak_year]["applications"]

    # Floor originations year (2007-2010)
    crisis_years = [y for y in years if int(y) <= 2010]
    orig_floor_year = min(crisis_years, key=lambda y: q1[y]["originations"])
    orig_floor_val = q1[orig_floor_year]["originations"]

    # Years until recovery: from floor to first year where origination_rate > floor rate
    floor_rate = q1[floor_year]["origination_rate"]
    recovery_start = None
    for y in sorted(years, key=int):
        if int(y) > int(floor_year) and q1[y]["origination_rate"] > floor_rate + 0.02:
            recovery_start = int(y)
            break
    years_to_recovery = (recovery_start - int(floor_year)) if recovery_start else 4

    return {
        "dataset": {
            "label": "HMDA",
            "start_year": int(min(years)),
            "end_year": int(max(years)),
            "total_records": fmt_millions(total_records),
        },
        "hero": {
            "metric_value": drop_pp,
            "metric_unit": "percentage points",
            "description": f"The drop in approval rates from {peak_year} to {floor_year}",
        },
        "chips": [
            {
                "value": fmt_millions(app_peak_val),
                "label": f"applications at the {app_peak_year} peak",
                "year": int(app_peak_year),
            },
            {
                "value": fmt_millions(orig_floor_val),
                "label": f"originated in the {orig_floor_year} floor",
                "year": int(orig_floor_year),
            },
            {
                "value": str(years_to_recovery),
                "label": "years until recovery began",
                "year": recovery_start or (int(floor_year) + years_to_recovery),
            },
        ],
    }


# ── 2. /story/collapse ────────────────────────────────────────────────────────


def build_collapse(state: dict) -> dict:
    q1 = state["q1"]
    q2 = state["q2"]

    base_year = "2007"
    floor_year = "2008"  # lowest origination_rate in crisis
    for y in ["2008", "2009", "2010"]:
        if q1[y]["origination_rate"] < q1[floor_year]["origination_rate"]:
            floor_year = y

    base_pct = approval_rate_pct(q1[base_year])
    floor_pct = approval_rate_pct(q1[floor_year])

    # Peak applications (any year)
    all_years = sorted(q1.keys(), key=int)
    app_peak_year = max(all_years, key=lambda y: q1[y]["applications"])

    # Floor originations (2007-2010)
    crisis_years = [y for y in all_years if int(y) <= 2010]
    orig_floor_year = min(crisis_years, key=lambda y: q1[y]["originations"])

    gap_series = []
    for y in ["2007", "2008", "2009", "2010"]:
        gap_series.append(
            {
                "year": int(y),
                "applications": round(q1[y]["applications"] / 1_000_000, 2),
                "originations": round(q1[y]["originations"] / 1_000_000, 2),
                "approvalRate": approval_rate_pct(q1[y]),
                "denialRate": round(q1[y]["denial_rate"] * 100, 1),
            }
        )

    loan_type_series = []
    for y in ["2007", "2008", "2009", "2010"]:
        conv = q2[y]["conventional_pct"]
        govt = round(100.0 - conv, 1)
        loan_type_series.append(
            {
                "year": int(y),
                "conventional": round(conv),
                "govtBacked": round(govt),
            }
        )

    return {
        "approval_shift": {
            "base_year": int(base_year),
            "base_pct": base_pct,
            "floor_year": int(floor_year),
            "floor_pct": floor_pct,
            "drop_pp": base_pct - floor_pct,
        },
        "markers": {
            "collapse_label_year": 2008,
            "floor_year": int(floor_year),
        },
        "gap_series": gap_series,
        "kpis": {
            "applications_peak_m": fmt_millions(q1[app_peak_year]["applications"]),
            "originations_floor_m": fmt_millions(q1[orig_floor_year]["originations"]),
            "approval_drop_pct": f"{base_pct - floor_pct}pp",
        },
        "loan_type_series": loan_type_series,
    }


# ── 3. /story/recovery ────────────────────────────────────────────────────────


def build_recovery(state: dict) -> dict:
    q1 = state["q1"]
    q2 = state["q2"]
    q3 = state["q3"]
    years = sorted(q1.keys(), key=int)

    # Gap series — full decade
    gap_series = []
    for y in years:
        gap_series.append(
            {
                "year": int(y),
                "applications": round(q1[y]["applications"] / 1_000_000, 2),
                "originations": round(q1[y]["originations"] / 1_000_000, 2),
            }
        )

    # Milestones
    floor_year = "2008"
    for y in ["2008", "2009", "2010"]:
        if q1[y]["origination_rate"] < q1[floor_year]["origination_rate"]:
            floor_year = y

    # Recovery start: first year after floor where rate improves meaningfully
    floor_rate = q1[floor_year]["origination_rate"]
    recovery_start_year = 2012  # default
    for y in years:
        if int(y) > int(floor_year) and q1[y]["origination_rate"] > floor_rate + 0.02:
            recovery_start_year = int(y)
            break

    # Refi series (index relative to 2010 baseline)
    baseline_refi = q3["2010"]["refi_n"]
    if baseline_refi == 0:
        baseline_refi = 1
    refi_series = []
    for y in years:
        if int(y) >= 2010:
            refi_n = q3[y]["refi_n"]
            refi_series.append(
                {
                    "year": int(y),
                    "refiIndex": round(refi_n / baseline_refi * 100, 1),
                }
            )

    # Refi peak
    refi_peak_year = max(
        [y for y in years if int(y) >= 2010],
        key=lambda y: q3[y]["refi_n"],
    )
    peak_index = round(q3[refi_peak_year]["refi_n"] / baseline_refi * 100, 1)
    delta_from_baseline = f"+{round(peak_index - 100)}%"

    # Loan type series — full decade
    loan_type_series = []
    for y in years:
        conv = q2[y]["conventional_pct"]
        govt = round(100.0 - conv, 1)
        loan_type_series.append(
            {
                "year": int(y),
                "conventional": round(conv),
                "govtBacked": round(govt),
            }
        )

    loan_purpose_series = []
    for y in years:
        purchase_share = round(q3[y]["purchase_share_pct"], 1)
        refi_share = round(q3[y]["refi_share_pct"], 1)
        loan_purpose_series.append(
            {
                "year": int(y),
                "purchaseShare": purchase_share,
                "refiShare": refi_share,
            }
        )

    # Structural shift
    govt_2007 = round(100.0 - q2["2007"]["conventional_pct"])
    govt_2017 = round(100.0 - q2["2017"]["conventional_pct"])

    return {
        "gap_series": gap_series,
        "milestones": {
            "floor_year": int(floor_year),
            "recovery_start_year": recovery_start_year,
            "approval_2007_pct": approval_rate_pct(q1["2007"]),
            "approval_2009_pct": approval_rate_pct(q1["2009"]),
            "approval_2012_pct": approval_rate_pct(q1["2012"]),
            "approval_2017_pct": approval_rate_pct(q1["2017"]),
        },
        "refi_series": refi_series,
        "refi_peak": {
            "year": int(refi_peak_year),
            "delta_from_baseline_pct": delta_from_baseline,
        },
        "loan_type_series": loan_type_series,
        "loan_purpose_series": loan_purpose_series,
        "structural_shift": {
            "govt_share_2007_pct": f"{govt_2007}%",
            "govt_share_2017_pct": f"{govt_2017}%",
        },
    }


# ── 4. /story/behavior-shift ──────────────────────────────────────────────────


def build_behavior_shift(state: dict) -> dict:
    q1 = state["q1"]
    q2 = state["q2"]
    q3 = state["q3"]
    q4 = state["q4"]
    q5 = state["q5"]

    vol_2007 = q5["2007"]
    vol_2017 = q5["2017"]

    def build_era(year_str: str) -> dict:
        """Build one era's data block."""
        vol = q5[year_str]
        conv_pct = round(q2[year_str]["conventional_pct"])
        govt_pct = round(100 - conv_pct)

        # Borrower profile
        profile = q4[year_str]
        median_income = profile["median_income_k"]
        income_str = f"${int(median_income * 1000):,}" if median_income else "N/A"
        approval = approval_rate_pct(q1[year_str])

        # Dominant purpose share
        purpose_code = profile["dominant_purpose_code"]
        purpose_key = {1: "purchase_n", 2: "improvement_n", 3: "refi_n"}.get(
            purpose_code, "purchase_n"
        )
        total_orig = q3[year_str]["total_originations"]
        purpose_count = q3[year_str].get(purpose_key, 0)
        purpose_share = round(purpose_count / total_orig * 100) if total_orig > 0 else 0

        # Received loan type label
        dominant_type = profile.get("dominant_loan_type", "Conventional")
        if dominant_type == "Conventional":
            type_label = "Conventional (private)"
        else:
            type_label = f"{dominant_type} (government)"

        # Geography (backward-compatible era cards)
        if year_str == "2007":
            metric_payload = build_originations_metric(vol)
        else:
            metric_payload = build_recovery_metric(vol_2007, vol)

        return {
            "lender_mix": {
                "conventional_pct": f"{conv_pct}%",
                "govt_backed_pct": f"{govt_pct}%",
                "second_mortgage_pct": "9%" if year_str == "2007" else "3%",
            },
            "borrower_profile": {
                "median_income_usd": income_str,
                "approval_rate_pct": f"{approval}%",
                "dominant_purpose_label": profile["dominant_purpose"],
                "dominant_purpose_pct": f"{purpose_share}%",
                "received_loan_type_label": type_label,
            },
            "geography": {
                "states": metric_payload["states"],
                "top_states": metric_payload["top_states"],
                "bottom_states": metric_payload["bottom_states"],
            },
        }

    era_2007 = build_era("2007")
    era_2017 = build_era("2017")

    # Comparison summaries derived from data
    income_07 = q4["2007"]["median_income_k"]
    income_17 = q4["2017"]["median_income_k"]
    approval_07 = approval_rate_pct(q1["2007"])
    approval_17 = approval_rate_pct(q1["2017"])

    # Geography explorer — single metric: recovery index vs 2007 baseline
    # Each state shows what % of its 2007 lending volume it has in the selected year.
    # 2007 = 100% for all states. Scrubbing forward reveals the crash and uneven recovery.
    years = sorted(q5.keys(), key=int)
    default_year = 2017 if "2017" in q5 else int(years[-1])
    yearly: dict[str, dict] = {}
    for year_str in years:
        vol_year = q5[year_str]
        yearly[year_str] = {
            "recovery_index": build_recovery_metric(vol_2007, vol_year),
        }

    return {
        "eras": {
            "2007": era_2007,
            "2017": era_2017,
        },
        "comparison": {
            "borrower_summary_2007": (
                f"The 2007 borrower had a median income of ${int(income_07 * 1000):,} "
                f"with a {approval_07}% approval rate."
            ),
            "borrower_summary_2017": (
                f"The 2017 borrower earns ${int(income_17 * 1000):,} "
                f"but faces a {approval_17}% approval rate."
            ),
            "lender_summary_2007": "Taking on risk was the business model.",
            "lender_summary_2017": "Safety first. Government guarantees preferred.",
        },
        "geography_explorer": {
            "years": [int(year) for year in years],
            "default_year": default_year,
            "metrics": {
                "recovery_index": {
                    "label": "Recovery index",
                    "unit": "% of 2007 lending volume",
                    "available": True,
                },
            },
            "yearly": yearly,
        },
    }


# ── 5. /story/summary ─────────────────────────────────────────────────────────


def build_summary(state: dict) -> dict:
    q1 = state["q1"]
    q2 = state["q2"]
    q5 = state["q5"]
    years = sorted(q1.keys(), key=int)

    # Crisis card
    floor_year = min(
        ["2008", "2009", "2010"],
        key=lambda y: q1[y]["origination_rate"],
    )
    peak_year = max(years, key=lambda y: q1[y]["origination_rate"])
    gap_pp = approval_rate_pct(q1[peak_year]) - approval_rate_pct(q1[floor_year])

    sparkline = []
    for y in years:
        sparkline.append(
            {
                "year": int(y),
                "applications": round(q1[y]["applications"] / 1_000_000, 2),
                "originations": round(q1[y]["originations"] / 1_000_000, 2),
            }
        )

    # Structural shift card
    govt_2007 = round(100 - q2["2007"]["conventional_pct"])
    govt_2017 = round(100 - q2["2017"]["conventional_pct"])

    # Recovery card — state rankings
    vol_2007 = q5["2007"]
    vol_2017 = q5["2017"]
    ri_items = []
    for abbr in sorted(set(vol_2007.keys()) & set(vol_2017.keys())):
        ri = recovery_index(vol_2007, vol_2017, abbr)
        if ri is not None:
            delta_pct = round((ri - 1) * 100)
            ri_items.append((abbr, ri, delta_pct))
    ri_items.sort(key=lambda x: x[1], reverse=True)

    ri_values = [ri for _, ri, _ in ri_items]
    low_cut = quantile_threshold(ri_values, 0.33)
    high_cut = quantile_threshold(ri_values, 0.67)

    def state_entry(abbr: str, ri: float, delta: int) -> dict:
        return {
            "state": ABBR_TO_NAME.get(abbr, abbr),
            "bucket": bucket_from_terciles(ri, low_cut, high_cut),
            "value": signed_pct(delta),
        }

    top_3 = ri_items[:3]
    bottom_3 = ri_items[-3:]

    recovery_states = [state_entry(a, r, d) for a, r, d in ri_items]
    top_states_list = [{"state": a, "value": signed_pct(d)} for a, _, d in top_3]
    bottom_states_list = [{"state": a, "value": signed_pct(d)} for a, _, d in bottom_3]

    # Generate summary sentence
    top_names = ", ".join(a for a, _, _ in top_3)
    bottom_names = " and ".join(a for a, _, _ in bottom_3[-2:])
    summary_sentence = (
        f"{top_names} were leading the recovery while "
        f"{bottom_names} were still below baseline by 2017."
    )

    return {
        "crisis_card": {
            "gap_peak_pp": f"-{gap_pp}pp",
            "peak_year": int(floor_year),
            "applications_m": fmt_millions(q1[floor_year]["applications"]),
            "originations_m": fmt_millions(q1[floor_year]["originations"]),
            "sparkline": sparkline,
        },
        "structural_shift_card": {
            "govt_share_2007_pct": govt_2007,
            "govt_share_2017_pct": govt_2017,
        },
        "recovery_card": {
            "states": recovery_states,
            "top_states": top_states_list,
            "bottom_states": bottom_states_list,
            "summary_sentence": summary_sentence,
        },
        "footer": {
            "headline": "The crisis lasted 2 years. The structural change it caused lasted a decade.",
            "source_label": "Source: HMDA Historic Data 2007-2017 — Consumer Financial Protection Bureau",
        },
    }


# ── main ───────────────────────────────────────────────────────────────────────


def main() -> None:
    print(f"Reading state from {STATE_FILE}")
    state = load_state()
    processed = sorted(state["years_processed"])
    print(f"Years available: {processed}")

    if len(processed) < 2:
        print("⚠ Need at least 2 years of data. Run mainPipeline.py for more years.")
        return

    print("\nExporting story JSONs:")
    save_json("story_landing.json", build_landing(state))
    save_json("story_collapse.json", build_collapse(state))
    save_json("story_recovery.json", build_recovery(state))
    save_json("story_behavior_shift.json", build_behavior_shift(state))
    save_json("story_summary.json", build_summary(state))
    print("\nDone.")


if __name__ == "__main__":
    main()
