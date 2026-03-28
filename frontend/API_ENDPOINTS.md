# HMDA Story API Endpoints

This document describes the frontend-facing `/story/*` contract used by the web app.

## Gradient Direction

The current UI implements the recommended light dashboard palette:

- Option A, implemented: Mist Blue + Warm Sand
- Option B: Soft Teal + Pearl
- Option C: Lavender Gray + Champagne

Only Option A is active in the app. The other two remain design alternatives, not API changes.

## `GET /story/landing`

### Brief

Provides the minimal overview payload for the first page.

### Why this endpoint is required

The overview page no longer needs hero metrics, teaser chips, or extra framing metadata. It only needs the story flow and the analyzed record count.

### Expected request input

- Method: `GET`
- Body: none
- Query params: none in v1

### Expected response

```json
{
  "narrative_arc": [
    "Overview",
    "Collapse",
    "Recovery",
    "Behavior Shift",
    "Summary"
  ],
  "total_records": 128734552
}
```

### Frontend usage

- `narrative_arc`: rendered as the centered narrative arc line on the overview page
- `total_records`: rendered below the arc in italic text

## `GET /story/collapse`

Supplies the collapse page with approval-shift metrics, gap-series data, KPI callouts, and loan-type mix data.

## `GET /story/recovery`

Supplies the recovery page with the long-run gap series, milestone values, refinance series, refinance peak, and structural-shift loan-type data.

## `GET /story/behavior-shift`

Supplies the toggle page with 2007 and 2017 era comparisons for lender mix, borrower profile, geography, and ranked state lists.

## `GET /story/summary`

Supplies the final page with crisis-card metrics, structural-shift values, recovery-map data, and the closing footer message.

## Notes

- The overview page intentionally stopped using the old landing payload fields:
  - `dataset.label`
  - `dataset.start_year`
  - `dataset.end_year`
  - `dataset.total_records` as a display block
  - `hero.*`
  - `chips[]`
- For temporary backward compatibility, the frontend still accepts `dataset.total_records` as a fallback if `total_records` is not yet present at the top level.
