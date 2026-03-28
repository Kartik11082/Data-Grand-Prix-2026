import os
import json
import matplotlib.pyplot as plt

def plot_refi_wave(json_path, output_img_path):
    with open(json_path, 'r') as f:
        data = json.load(f)
        
    if not data:
        print("Error: JSON payload is missing or empty.")
        return

    years = [d["year"] for d in data]
    indices = [d["refi_index"] for d in data]
    
    plt.figure(figsize=(10, 5))
    
    # Plot formal boundaries for baseline
    plt.plot(years, indices, color="#d97706", linewidth=2, label="Refinance Index")
    plt.fill_between(years, indices, 0, color="#fbbf24", alpha=0.3)
    plt.axhline(y=100, color="gray", linestyle="--", linewidth=1, label="2010 Baseline (100.0)")
    
    # Auto-detect peak for dramatic annotation payload
    peak_idx = max(indices)
    peak_year = years[indices.index(peak_idx)]
    
    plt.annotate(
        "Fed rate cuts",
        xy=(peak_year, peak_idx),
        xytext=(peak_year, peak_idx + 15),
        arrowprops=dict(facecolor='black', arrowstyle="->", connectionstyle="arc3"),
        horizontalalignment='center',
        fontweight='bold',
    )
    
    plt.title("The Refinancing Wave (2010-2017)")
    plt.xlabel("Year")
    plt.ylabel("Refinance Volume Index (2010 = 100)")
    plt.xlim(min(years), max(years))
    
    # Dynamically scale Y ceiling to let the peak breathe
    plt.ylim(0, max(indices) + 25)
    
    plt.legend()
    plt.grid(alpha=0.3)
    
    plt.savefig(output_img_path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"Chart successfully saved to: {output_img_path}")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_path = os.path.join(script_dir, "output", "refi_wave.json")
    out_img = os.path.join(script_dir, "output", "refi_wave_chart.png")

    print(f"Reading target payload: {json_path}")
    plot_refi_wave(json_path, out_img)
