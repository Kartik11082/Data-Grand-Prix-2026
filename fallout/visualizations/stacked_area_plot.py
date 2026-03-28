import os
import json
import plotly.graph_objects as go

def plot_chart(json_path):
    with open(json_path, 'r') as f:
        json_data = json.load(f)

    if not json_data:
        print("Error: JSON data is empty or missing.")
        return

    years = [row["year"] for row in json_data]
    conventional = [row["conventional"] for row in json_data]
    govt_backed = [row["govt_backed"] for row in json_data]

    fig = go.Figure()

    fig.add_trace(go.Scatter(
        x=years, y=conventional, mode="lines", name="Conventional",
        line=dict(width=0), fill="tozeroy", fillcolor="#378ADD", stackgroup="one"
    ))

    fig.add_trace(go.Scatter(
        x=years, y=govt_backed, mode="lines", name="Govt-Backed (FHA/VA/FSA)",
        line=dict(width=0), fill="tonexty", fillcolor="#639922", stackgroup="one"
    ))

    fig.update_layout(
        title="Originated Loans Composition (2007–2017)",
        xaxis_title="Year", yaxis_title="Percent of Originated Loans (%)",
        yaxis=dict(ticksuffix="%", range=[0, 100]),
        xaxis=dict(tickmode="linear", dtick=1),
        hovermode="x unified", template="plotly_dark",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1, bgcolor="rgba(0,0,0,0.5)")
    )
    fig.show()

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_path = os.path.join(script_dir, "output", "loan_type_composition.json")
    print(f"Loading data from {json_path}...")
    plot_chart(json_path)
