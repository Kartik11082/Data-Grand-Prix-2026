import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "output")
STORY_DIR = os.path.join(OUTPUT_DIR, "story")
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
HMDA_STATE_FRONTEND_DIR = os.path.join(REPO_ROOT, "hmda_state", "frontend")

logger = logging.getLogger("hmda_api")
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setFormatter(logging.Formatter("%(levelname)s - %(message)s"))
logger.addHandler(ch)

app = FastAPI(
    title="Data Grand Prix API",
    description="Serves precomputed HMDA chart and story JSON exports to the visualization frontend.",
    version="1.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def serve_json_file(filename: str) -> FileResponse:
    """Serve a JSON file from the main output directory."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(filepath):
        logger.error(f"Missing file: {filepath}")
        raise HTTPException(
            status_code=404,
            detail=f"'{filename}' not found. Run the pipeline to generate it.",
        )
    return FileResponse(filepath, media_type="application/json")


def serve_story_json(filename: str) -> FileResponse:
    """Serve a JSON file from the story subdirectory (output/story/)."""
    filepath = os.path.join(STORY_DIR, filename)
    if not os.path.exists(filepath):
        logger.error(f"Missing story file: {filepath}")
        raise HTTPException(
            status_code=404,
            detail=f"'{filename}' not found. Run export_story_json.py to generate it.",
        )
    return FileResponse(filepath, media_type="application/json")


def serve_hmda_state_frontend_json(filename: str) -> FileResponse:
    """Serve a JSON file from hmda_state/frontend/."""
    filepath = os.path.join(HMDA_STATE_FRONTEND_DIR, filename)
    if not os.path.exists(filepath):
        logger.error(f"Missing hmda_state frontend file: {filepath}")
        raise HTTPException(
            status_code=404,
            detail=f"'{filename}' not found in hmda_state/frontend. Run the batch job to generate it.",
        )
    return FileResponse(filepath, media_type="application/json")


# ── system ────────────────────────────────────────────────────────────────────


@app.get("/", tags=["system"])
async def root() -> dict:
    """API index — lists all active endpoints."""
    return {
        "status": "online",
        "version": "1.2.0",
        "chart_endpoints": {
            "/chart1": "gap_chart.json | Gap area chart (Fallout)",
            "/chart2": "loan_type_composition.json | Loan type composition (Fallout)",
            "/chart3": "gap_chart.json | Full-decade gap chart (Recovery)",
            "/chart4": "refi_wave.json | Refinancing wave index (Recovery)",
            "/chart5": "loan_type_composition.json | Loan type composition (Recovery)",
            "/chart6": "loan_type_amount_composition.json | Loan-type amount companion data (Collapse + Recovery)",
        },
        "story_endpoints": {
            "/story/landing": "story_landing.json | Hero metric + dataset metadata + stat chips",
            "/story/collapse": "story_collapse.json | 2007-2010 crisis data",
            "/story/recovery": "story_recovery.json | Full-decade recovery data + loan purpose composition",
            "/story/behavior-shift": "story_behavior_shift.json | Era comparison + geography explorer (2007-2017)",
            "/story/summary": "story_summary.json | Executive summary cards",
        },
    }


# ── chart endpoints (legacy) ──────────────────────────────────────────────────


@app.get("/chart1", response_class=FileResponse, tags=["charts"])
async def get_chart1() -> FileResponse:
    """Gap area chart — applications vs originations 2007-2010."""
    logger.info("Serving /chart1 -> gap_chart.json")
    return serve_json_file("gap_chart.json")


@app.get("/chart2", response_class=FileResponse, tags=["charts"])
async def get_chart2() -> FileResponse:
    """Loan type composition — conventional vs govt-backed."""
    logger.info("Serving /chart2 -> loan_type_composition.json")
    return serve_json_file("loan_type_composition.json")


@app.get("/chart3", response_class=FileResponse, tags=["charts"])
async def get_chart3() -> FileResponse:
    """Full-decade gap chart — the gap started closing."""
    logger.info("Serving /chart3 -> gap_chart.json")
    return serve_json_file("gap_chart.json")


@app.get("/chart4", response_class=FileResponse, tags=["charts"])
async def get_chart4() -> FileResponse:
    """Refinancing wave index — 2010-2017."""
    logger.info("Serving /chart4 -> refi_wave.json")
    return serve_json_file("refi_wave.json")


@app.get("/chart5", response_class=FileResponse, tags=["charts"])
async def get_chart5() -> FileResponse:
    """Loan type composition — full decade view."""
    logger.info("Serving /chart5 -> loan_type_composition.json")
    return serve_json_file("loan_type_composition.json")


@app.get("/chart6", response_class=FileResponse, tags=["charts"])
async def get_chart6() -> FileResponse:
    """Loan type amount companion data — count shares plus originated loan amounts."""
    logger.info("Serving /chart6 -> hmda_state/frontend/loan_type_amount_composition.json")
    return serve_hmda_state_frontend_json("loan_type_amount_composition.json")


# ── story endpoints ───────────────────────────────────────────────────────────


@app.get("/story/landing", response_class=FileResponse, tags=["story"])
async def get_story_landing() -> FileResponse:
    """Landing page data — hero metric, dataset metadata, stat chips."""
    logger.info("Serving /story/landing -> story_landing.json")
    return serve_story_json("story_landing.json")


@app.get("/story/collapse", response_class=FileResponse, tags=["story"])
async def get_story_collapse() -> FileResponse:
    """Collapse page data — 2007-2010 gap series, loan type series, KPIs."""
    logger.info("Serving /story/collapse -> story_collapse.json")
    return serve_story_json("story_collapse.json")


@app.get("/story/recovery", response_class=FileResponse, tags=["story"])
async def get_story_recovery() -> FileResponse:
    """Recovery page data — full-decade gap, refi index, loan purpose mix, milestones, structural shift."""
    logger.info("Serving /story/recovery -> story_recovery.json")
    return serve_story_json("story_recovery.json")


@app.get("/story/behavior-shift", response_class=FileResponse, tags=["story"])
async def get_story_behavior_shift() -> FileResponse:
    """Behavior shift page data - era comparison + geography explorer."""
    logger.info("Serving /story/behavior-shift -> story_behavior_shift.json")
    return serve_story_json("story_behavior_shift.json")


@app.get("/story/summary", response_class=FileResponse, tags=["story"])
async def get_story_summary() -> FileResponse:
    """Summary page data — crisis card, structural shift card, recovery rankings."""
    logger.info("Serving /story/summary -> story_summary.json")
    return serve_story_json("story_summary.json")


# ── entrypoint ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    logger.info("Starting uvicorn on 0.0.0.0:8000...")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

