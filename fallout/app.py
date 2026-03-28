import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "output")

logger = logging.getLogger("hmda_api")
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setFormatter(logging.Formatter("%(levelname)s - %(message)s"))
logger.addHandler(ch)

app = FastAPI(
    title="Data Grand Prix API",
    description="Hyper-minimal backend serving static JSON exports to the visualization frontend.",
    version="1.0.0",
)

# Crucial CORS configuration opening the door for frontend accessibility natively
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def serve_json_file(filename: str) -> FileResponse:
    """
    Hyper-efficient retrieval function validating file existence, returning a native FileResponse.
    It bypasses all computational parsing constraints (e.g., json.loads/dumps).
    """
    filepath = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(filepath):
        logger.error(f"Missing resource dynamically requested: {filepath}")
        raise HTTPException(
            status_code=404,
            detail=f"Data file '{filename}' was not found gracefully on disk. Pipeline execution needed.",
        )
    return FileResponse(filepath, media_type="application/json")


@app.get("/", tags=["system"])
async def root() -> dict:
    """Returns directory of active API pipelines mapped directly to dashboard components."""
    return {
        "status": "online",
        "description": "HMDA Chart API active. Serving precomputed visuals.",
        "endpoints": {
            "/chart1": "gap_chart.json | Gap Area Chart (Fallout)",
            "/chart2": "loan_type_composition.json | Private lenders fled. Government stepped in.",
            "/chart3": "gap_chart.json | The gap started closing Full decade view",
            "/chart4": "refi_wave.json | Borrowers refinanced en masse. Refinancing volume index",
            "/chart5": "loan_type_composition.json | Government lending never retreated. Loan type composition",
        },
    }


@app.get("/chart1", response_class=FileResponse, tags=["charts"])
async def get_chart1() -> FileResponse:
    """Chart #1 mapping -> Gap Area Chart 2007-2010"""
    logger.info("Serving /chart1 -> gap_chart.json")
    return serve_json_file("gap_chart.json")


@app.get("/chart2", response_class=FileResponse, tags=["charts"])
async def get_chart2() -> FileResponse:
    """
    Chart #2 mapping -> Private lenders fled / Govt stepped in.
    """
    logger.info("Serving /chart2 -> loan_type_composition.json")
    return serve_json_file("loan_type_composition.json")


@app.get("/chart3", response_class=FileResponse, tags=["charts"])
async def get_chart3() -> FileResponse:
    """Chart #3 mapping -> The gap started closing"""
    logger.info("Serving /chart3 -> gap_chart.json")
    return serve_json_file("gap_chart.json")


@app.get("/chart4", response_class=FileResponse, tags=["charts"])
async def get_chart4() -> FileResponse:
    """Chart #4 mapping -> The Fed cut rates. Refinancing wave"""
    logger.info("Serving /chart4 -> refi_wave.json")
    return serve_json_file("refi_wave.json")


@app.get("/chart5", response_class=FileResponse, tags=["charts"])
async def get_chart5() -> FileResponse:
    """Chart #5 mapping -> Loan type composition"""
    logger.info("Serving /chart5 -> loan_type_composition.json")
    return serve_json_file("loan_type_composition.json")


if __name__ == "__main__":
    import uvicorn

    # Executed seamlessly when triggered as a local standalone `python app.py`
    # Bound to typical full-stack environment defaults (8000, hot reload enabled via robust string-app reference)
    logger.info(
        "Triggering development uvicorn server mapping exclusively to 0.0.0.0:8000..."
    )
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
