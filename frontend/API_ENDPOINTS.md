# HMDA Story API Endpoints

This document defines the canonical backend contract for the web app's story endpoints.

The frontend currently renders hardcoded story data from `frontend/src/storySeed.ts`, but the intended backend contract is the `/story/*` family documented below.

The calculation rules in this document are based on the current Spark pipelines and output JSON files in `fallout/`. Those pipelines are treated as the executable interpretation of `chart_spec.md.pdf`.

## General Rules

- All `/story/*` endpoints are `GET` endpoints.
- v1 request shape: no request body and no required query parameters.
- The backend returns data-ready numeric fields wherever possible.
- The frontend is responsible for formatting display strings such as `6.8M`, `29pp`, and currency labels.
- The backend should compute narrative metrics from one consistent aggregate source per story beat, not from disconnected manual constants.

## `/story/landing`

### Brief

Provides the opening dataset framing, lead metric, and teaser chips for the HMDA mortgage story.

### Why This Endpoint Is Required

The landing page needs one compact response that explains:

- what dataset is being used
- what years are covered
- what headline number anchors the story
- which three preview metrics invite the user into the narrative

Without this endpoint, the frontend would keep carrying disconnected hardcoded values for the opening hero and chip labels.

### Expected Request Input

- Method: `GET`
- Body: none
- Query params: none in v1

### Backend Source Data Required

- Full analysis year window: 2007 through 2017
- Total HMDA corpus row count across the full supported dataset
- Yearly application and origination totals across the decade
- Yearly approval-rate aggregates for the milestone years used in the story intro
- Recovery-start milestone year used elsewhere in the story flow

### Calculation Rules

- `dataset.label`
  - Static dataset label, e.g. `HMDA`
- `dataset.start_year`
  - Fixed from the supported story window: `2007`
- `dataset.end_year`
  - Fixed from the supported story window: `2017`
- `dataset.total_records`
  - Count all records across the full corpus used for the story
  - Return as a raw integer if possible
  - The frontend may abbreviate it to `170M`
- `hero.metric_value`
  - Approval-rate drop in percentage points from 2007 to 2009
  - Formula: `approval_rate_2007 - approval_rate_2009`
  - This should come from the story's approval-rate aggregate, not from display formatting
- `hero.metric_unit`
  - Fixed string: `percentage points`
- `hero.description`
  - Fixed narrative label tied to the hero metric
  - Example: `The drop in approval rates from 2007 to 2009`
- `chips[0]`
  - `year`: year with peak applications in the decade
  - `value`: applications total for that year
  - `label`: narrative label for the peak-applications teaser
- `chips[1]`
  - `year`: year with minimum originations in the collapse/recovery frame
  - `value`: originations total for that year
  - `label`: narrative label for the floor teaser
- `chips[2]`
  - `year`: recovery-start anchor year
  - `value`: elapsed years between the crisis onset used by the story and the recovery-start marker
  - Story logic currently expects recovery start in 2012 and a crisis onset of 2008
  - Formula: `2012 - 2008 = 4`

### Expected Response

```json
{
  "dataset": {
    "label": "HMDA",
    "start_year": 2007,
    "end_year": 2017,
    "total_records": 170000000
  },
  "hero": {
    "metric_value": 29,
    "metric_unit": "percentage points",
    "description": "The drop in approval rates from 2007 to 2009"
  },
  "chips": [
    { "label": "applications at the 2007 peak", "value": 6800000, "year": 2007 },
    { "label": "originated in the 2009 floor", "value": 2300000, "year": 2009 },
    { "label": "years until recovery began", "value": 4, "year": 2012 }
  ]
}
```

## `/story/collapse`

### Brief

Supplies the two collapse beats:

- the mortgage freeze itself
- the shift from private lending to government-backed lending

### Why This Endpoint Is Required

The collapse page should be backed by one contract that explains both the applications-vs-originations gap and the 2007 to 2010 loan-type shift. This avoids splitting one narrative page across unrelated endpoints.

### Expected Request Input

- Method: `GET`
- Body: none
- Query params: none in v1

### Backend Source Data Required

- `fallout/pipelines/credit_freeze_pipeline.py`
- `fallout/output/credit_freeze_analysis.json`
- `fallout/pipelines/stacked_area_pipeline.py`
- A 2007 to 2010 subset of loan-type composition
- Story milestone years:
  - collapse label year: `2008`
  - floor year: `2009`

### Calculation Rules

#### Market Metrics

These come from `credit_freeze_pipeline.py`.

- Base filter:
  - exclude purchased loans where `action_taken = 6`
- `applications`
  - count remaining rows for each year
- `originations`
  - sum rows where `action_taken = 1`
- `denials`
  - sum rows where `action_taken = 3`
- `approval_rate`
  - formula: `originations / applications`
- `denial_rate`
  - formula: `denials / applications`

The current pipeline computes this for 2007 to 2010 and exports grouped market segments, including `Total Market`.

#### Approval Shift

- `approval_shift.base_year = 2007`
- `approval_shift.floor_year = 2009`
- `approval_shift.base_pct`
  - approval rate for 2007 from the selected story approval-rate series
- `approval_shift.floor_pct`
  - approval rate for 2009 from the selected story approval-rate series
- `approval_shift.drop_pp`
  - formula: `base_pct - floor_pct`

#### Gap Series

- `gap_series[]`
  - return one row per year from 2007 through 2010
  - each row includes:
    - `year`
    - `applications`
    - `originations`
    - `approval_rate`
    - `denial_rate`

#### Markers

- `markers.collapse_label_year = 2008`
- `markers.floor_year = 2009`

#### KPIs

- `kpis.applications_peak_m`
  - max applications across 2007 to 2010
- `kpis.originations_floor_m`
  - min originations across 2007 to 2010
- `kpis.approval_drop_pct`
  - same percentage-point drop used in `approval_shift.drop_pp`

#### Loan-Type Series

These come from `stacked_area_pipeline.py`.

- read originated-loan rows year by year
- cast `action_taken` and `loan_type` to integers
- filter:
  - `action_taken == 1`
  - `loan_type != 5`
- conventional count:
  - `loan_type == 1`
- government-backed count:
  - `loan_type IN (2, 3, 4)`
- total:
  - `conventional_count + govt_count`
- `conventional_pct`
  - `(conventional_count / total) * 100`
- `govt_backed_pct`
  - `(govt_count / total) * 100`

For this endpoint, return the 2007 to 2010 subset only.

### Expected Response

```json
{
  "approval_shift": {
    "base_year": 2007,
    "base_pct": 84,
    "floor_year": 2009,
    "floor_pct": 55,
    "drop_pp": 29
  },
  "markers": {
    "collapse_label_year": 2008,
    "floor_year": 2009
  },
  "gap_series": [
    {
      "year": 2007,
      "applications": 21824281,
      "originations": 10441545,
      "approval_rate": 0.4784,
      "denial_rate": 0.2727
    }
  ],
  "kpis": {
    "applications_peak_m": 21.824281,
    "originations_floor_m": 7.177262,
    "approval_drop_pct": 29
  },
  "loan_type_series": [
    { "year": 2007, "conventional_pct": 88.0, "govt_backed_pct": 12.0 }
  ]
}
```

## `/story/recovery`

### Brief

Supplies the recovery page's three beats:

- the gap starts closing
- refinancing spikes
- the government-backed share never fully retreats

### Why This Endpoint Is Required

The recovery page currently depends on three distinct backend derivations. The story page should not orchestrate them itself. One endpoint should package the full recovery narrative.

### Expected Request Input

- Method: `GET`
- Body: none
- Query params: none in v1

### Backend Source Data Required

- `fallout/pipelines/extended_gap_pipeline.py`
- `fallout/output/gap_chart.json`
- `fallout/pipelines/refinance_wave_pipeline.py`
- `fallout/output/refi_wave.json`
- `fallout/pipelines/stacked_area_pipeline.py`
- `fallout/output/loan_type_composition.json`
- Story milestone years:
  - floor year: `2009`
  - recovery start year: `2012`

### Calculation Rules

#### Gap Series

These come from `extended_gap_pipeline.py`.

- Iterate years 2007 to 2017
- Source-file fallback order:
  - originated-records folder
  - all-records folder
  - originated-records CSV in root
  - all-records CSV in root
  - originated-records ZIP
  - all-records ZIP
- Base filter:
  - exclude purchased loans where `action_taken = 6`
- `applications`
  - formula: `count(*) / 1_000_000`
- `originations`
  - formula: `sum(action_taken == 1) / 1_000_000`
- Round both to 2 decimals

#### Milestones

- `milestones.floor_year = 2009`
- `milestones.recovery_start_year = 2012`
- `milestones.approval_2007_pct`
- `milestones.approval_2009_pct`
- `milestones.approval_2012_pct`
- `milestones.approval_2017_pct`
  - derive from the yearly approval-rate aggregate used by the story
  - keep one consistent approval-rate definition across all milestone fields

#### Refinance Series

These come from `refinance_wave_pipeline.py`.

- Iterate years 2010 to 2017
- Filter rows to:
  - `action_taken == 1`
  - `loan_purpose == 3`
- `refi_count`
  - count matching rows
- Baseline year:
  - use 2010 refinance count
- `refi_index`
  - formula: `(refi_count / refi_count_2010) * 100`
- Round `refi_index` to 1 decimal

#### Refi Peak

- `refi_peak.year`
  - year with max `refi_index`
- `refi_peak.delta_from_baseline_pct`
  - formula: `max(refi_index) - 100`
  - express as the percent change above baseline

#### Long-Run Loan-Type Series

These come from `stacked_area_pipeline.py`.

- same composition logic as the collapse page
- return 2007 through 2017 instead of just the 2007 through 2010 subset

#### Structural Shift

- `structural_shift.govt_share_2007_pct`
  - government-backed share in 2007
- `structural_shift.govt_share_2017_pct`
  - government-backed share in 2017

### Expected Response

```json
{
  "gap_series": [
    { "year": 2007, "applications": 10.44, "originations": 10.44 }
  ],
  "milestones": {
    "floor_year": 2009,
    "recovery_start_year": 2012,
    "approval_2007_pct": 84,
    "approval_2009_pct": 55,
    "approval_2012_pct": 65,
    "approval_2017_pct": 74
  },
  "refi_series": [
    { "year": 2010, "refi_count": 4972333, "refi_index": 100.0 }
  ],
  "refi_peak": {
    "year": 2012,
    "delta_from_baseline_pct": 33.9
  },
  "loan_type_series": [
    { "year": 2007, "conventional_pct": 88.0, "govt_backed_pct": 12.0 }
  ],
  "structural_shift": {
    "govt_share_2007_pct": 12.0,
    "govt_share_2017_pct": 33.0
  }
}
```

## `/story/behavior-shift`

### Brief

Provides the two-era comparison payload for:

- lenders
- borrowers
- state geography
- ranked top and bottom states
- short comparison summaries

### Why This Endpoint Is Required

The behavior-shift page compares 2007 and 2017 side by side. The frontend should not invent these comparison values. It needs one endpoint that returns both eras from one consistent set of yearly and state-level aggregates.

### Expected Request Input

- Method: `GET`
- Body: none
- Query params: none in v1

### Backend Source Data Required

- Loan-type composition by year from the same logic as `stacked_area_pipeline.py`
- Lien-status-based aggregates for second-mortgage share
- Borrower income and approval-rate aggregates for 2007 and 2017
- Loan-purpose distribution for 2007 and 2017
- State-level market metrics for ranking and bucket assignment
- Derived comparison summaries

### Calculation Rules

#### Era Keys

- The response must contain exactly:
  - `eras["2007"]`
  - `eras["2017"]`

#### Lender Mix

- `lender_mix.conventional_pct`
  - derived from originated-loan composition
- `lender_mix.govt_backed_pct`
  - derived from originated-loan composition
- `lender_mix.second_mortgage_pct`
  - derive from lien-status-based aggregates
  - recommended definition:
    - numerator: rows representing second-lien or higher-risk second-mortgage lending for the chosen year
    - denominator: total originated loans for the same year
  - the exact lien-status mapping must stay consistent between 2007 and 2017

#### Borrower Profile

- `borrower_profile.median_income_usd`
  - compute median applicant income for the chosen borrower population in that year
  - keep the same borrower slice across both eras
- `borrower_profile.approval_rate_pct`
  - approval rate for the same borrower slice
- `borrower_profile.dominant_purpose_label`
  - identify the loan-purpose category with the highest share for that year
- `borrower_profile.dominant_purpose_pct`
  - return that category's share
- `borrower_profile.received_loan_type_label`
  - derive the dominant loan-type label for the same borrower population

#### Geography

- `geography.states[]`
  - calculate a state-level metric for each state
  - examples:
    - raw loan volume for 2007
    - recovery index or normalized recovery score for 2017
- each row must contain:
  - `state`
  - `value`
  - `bucket`
- `bucket`
  - assign a visual tier such as:
    - `high`
    - `medium`
    - `low`
- `top_states[]`
  - sort descending by the same state-level metric used for the map
- `bottom_states[]`
  - sort ascending by that same metric

#### Comparison Summaries

- `comparison.borrower_summary_2007`
- `comparison.borrower_summary_2017`
- `comparison.lender_summary_2007`
- `comparison.lender_summary_2017`

These should be generated from the actual aggregate deltas, not independently written copy that can drift away from the data.

### Expected Response

```json
{
  "eras": {
    "2007": {
      "lender_mix": {
        "conventional_pct": 88.0,
        "govt_backed_pct": 12.0,
        "second_mortgage_pct": 9.0
      },
      "borrower_profile": {
        "median_income_usd": 72000,
        "approval_rate_pct": 84,
        "dominant_purpose_label": "Home purchase",
        "dominant_purpose_pct": 52,
        "received_loan_type_label": "Conventional (private)"
      },
      "geography": {
        "states": [
          { "state": "California", "value": 1200000, "bucket": "high" }
        ],
        "top_states": [
          { "state": "CA", "value": 1200000, "label": "Top lending state by volume" }
        ],
        "bottom_states": [
          { "state": "WY", "value": 18000, "label": "Smallest lending volume" }
        ]
      }
    },
    "2017": {
      "lender_mix": {
        "conventional_pct": 67.0,
        "govt_backed_pct": 33.0,
        "second_mortgage_pct": 3.0
      },
      "borrower_profile": {
        "median_income_usd": 91000,
        "approval_rate_pct": 74,
        "dominant_purpose_label": "Refinancing",
        "dominant_purpose_pct": 48,
        "received_loan_type_label": "Often FHA-backed (government)"
      },
      "geography": {
        "states": [
          { "state": "Texas", "value": 1.42, "bucket": "high" }
        ],
        "top_states": [
          { "state": "TX", "value": 1.42, "label": "Fast recovery index" }
        ],
        "bottom_states": [
          { "state": "NV", "value": 0.52, "label": "Still below baseline" }
        ]
      }
    }
  },
  "comparison": {
    "borrower_summary_2007": "The 2007 borrower had less income but easier access.",
    "borrower_summary_2017": "The 2017 borrower earns more but faces tighter standards.",
    "lender_summary_2007": "Taking on risk was the business model.",
    "lender_summary_2017": "Safety first. Government guarantees preferred."
  }
}
```

## `/story/summary`

### Brief

Provides the sponsor-facing close by compressing the earlier story beats into:

- one crisis card
- one structural-shift card
- one recovery card
- one final takeaway

### Why This Endpoint Is Required

The summary page should not re-encode values that already exist in earlier story beats. It should be derived from the same upstream aggregates so the close always stays consistent with the main story.

### Expected Request Input

- Method: `GET`
- Body: none
- Query params: none in v1

### Backend Source Data Required

- Gap-series source used by collapse and recovery
- Government-backed share source used by recovery and behavior shift
- State-level recovery rankings used by behavior shift
- Final story source label and footer conclusion

### Calculation Rules

#### Crisis Card

- `crisis_card.sparkline[]`
  - reuse the decade gap-series source
- `crisis_card.gap_peak_pp`
  - the peak percentage-point gap or narrative crisis gap metric used in the story close
- `crisis_card.peak_year`
  - year where the peak occurs
- `crisis_card.applications_m`
  - applications total for the peak year
- `crisis_card.originations_m`
  - originations total for the peak year

#### Structural Shift Card

- `structural_shift_card.govt_share_2007_pct`
  - reuse 2007 government-backed share
- `structural_shift_card.govt_share_2017_pct`
  - reuse 2017 government-backed share

#### Recovery Card

- `recovery_card.states[]`
  - reuse the same state-level recovery payload as the behavior-shift page
- `recovery_card.top_states[]`
  - top-ranked states from that same metric
- `recovery_card.bottom_states[]`
  - bottom-ranked states from that same metric
- `recovery_card.summary_sentence`
  - generate from the top and bottom states shown in the card

#### Footer

- `footer.headline`
  - fixed editorial closing statement supported by the story metrics
- `footer.source_label`
  - fixed source attribution

### Expected Response

```json
{
  "crisis_card": {
    "gap_peak_pp": -29,
    "peak_year": 2009,
    "applications_m": 4.2,
    "originations_m": 2.3,
    "sparkline": [
      { "year": 2007, "applications": 6.8, "originations": 5.7 }
    ]
  },
  "structural_shift_card": {
    "govt_share_2007_pct": 12.0,
    "govt_share_2017_pct": 33.0
  },
  "recovery_card": {
    "states": [
      { "state": "Texas", "value": 42, "bucket": "high" }
    ],
    "top_states": [
      { "state": "TX", "value": 42 }
    ],
    "bottom_states": [
      { "state": "NV", "value": -48 }
    ],
    "summary_sentence": "TX, CO, and DC were leading the recovery by 2014 while NV and FL were still below baseline in 2017."
  },
  "footer": {
    "headline": "The crisis lasted 2 years. The structural change it caused lasted a decade.",
    "source_label": "Source: HMDA Historic Data 2007-2017 - Consumer Financial Protection Bureau"
  }
}
```

## Compatibility Appendix: Current Backend Routes

The backend currently serves `/chart1` through `/chart5` from `fallout/app.py`. These are the existing data routes that should eventually be absorbed into the `/story/*` contract.

### `/chart1`

- Current source: `gap_chart.json`
- Current purpose: collapse/fallout gap chart
- Story mapping:
  - supports `/story/collapse.gap_series`

### `/chart2`

- Current source: `loan_type_composition.json`
- Current purpose: private vs government-backed loan composition
- Story mapping:
  - supports `/story/collapse.loan_type_series`

### `/chart3`

- Current source: `gap_chart.json`
- Current purpose: full-decade gap view
- Story mapping:
  - supports `/story/recovery.gap_series`

### `/chart4`

- Current source: `refi_wave.json`
- Current purpose: refinance wave index
- Story mapping:
  - supports `/story/recovery.refi_series`
  - supports `/story/recovery.refi_peak`

### `/chart5`

- Current source: `loan_type_composition.json`
- Current purpose: long-run government-backed share
- Story mapping:
  - supports `/story/recovery.loan_type_series`
  - supports `/story/recovery.structural_shift`

## Notes On Current Gaps

- The current repo contains executable calculations for:
  - market gap metrics
  - loan-type composition
  - refinance counts and index
- The behavior-shift endpoint still needs dedicated backend implementation for:
  - borrower medians and purpose shares
  - second-mortgage share
  - state-level rankings and bucket assignment
  - generated comparison summaries
- The summary endpoint should be assembled from upstream aggregates rather than maintaining a separate manual source of truth.
