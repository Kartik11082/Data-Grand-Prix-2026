import json
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# 1. Read the JSON structure
file_path = r"c:\Users\karke\OneDrive\Desktop\projects\DataGrandPrix\fallout\output\credit_freeze_analysis.json"

with open(file_path, "r") as f:
    data = json.load(f)

# 2. Extract Data for 'Total Market' segment
total_market_data = next(
    (item["data"] for item in data if item["segment"] == "Total Market"), None
)

if not total_market_data:
    raise ValueError("Total Market segment not found in the JSON file.")

# Extract series
years = [row["year"] for row in total_market_data]
applications = [row["applications"] for row in total_market_data]
originations = [row["originations"] for row in total_market_data]
approval_rates = [row["approval_rate"] for row in total_market_data]

# 3. Create Gap Area Chart with a secondary axis for Approval Rate
fig = make_subplots(specs=[[{"secondary_y": True}]])

# Plot Originations (Bottom line)
fig.add_trace(
    go.Scatter(
        x=years,
        y=originations,
        mode="lines+markers",
        name="Originations",
        line=dict(color="#2ca02c", width=3),
    ),
    secondary_y=False,
)

# Plot Applications (Top line) and fill the gap to the underlying originations trace
fig.add_trace(
    go.Scatter(
        x=years,
        y=applications,
        mode="lines+markers",
        name="Applications",
        line=dict(color="#1f77b4", width=3),
        fill="tonexty",
        fillcolor="rgba(214, 39, 40, 0.3)",  # Red-tinted fill representing the "unapproved gap"
    ),
    secondary_y=False,
)

# Overlay Approval Rate for context (Secondary Axis)
fig.add_trace(
    go.Scatter(
        x=years,
        y=approval_rates,
        mode="lines+markers",
        name="Approval Rate",
        line=dict(color="#ff7f0e", width=2, dash="dash"),
    ),
    secondary_y=True,
)

# 4. Apply title, labels, and formatting
fig.update_layout(
    title="HMDA Credit Freeze Analysis: The Unapproved Gap (Total Market)",
    xaxis_title="Year",
    xaxis=dict(tickmode="linear", dtick=1),
    hovermode="x unified",
    template="plotly_dark",
    legend=dict(
        yanchor="top", y=0.99, xanchor="left", x=0.01, bgcolor="rgba(0,0,0,0.5)"
    ),
)

fig.update_yaxes(title_text="Volume (Count)", secondary_y=False)
fig.update_yaxes(title_text="Approval Rate", tickformat=".1%", secondary_y=True)

# 5. Render
fig.show()
