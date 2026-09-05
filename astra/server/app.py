from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from astra import __version__
from astra.server.routes.dashboard import router as dashboard_router
from astra.server.routes.actors import router as actors_router
from astra.server.routes.graph import router as graph_router
from astra.server.routes.attribution import router as attribution_router
from astra.server.routes.infra import router as infra_router
from astra.server.routes.evidence import router as evidence_router
from astra.server.routes.leads import router as leads_router
from astra.server.routes.demo import router as demo_router
from astra.server.routes.export import router as export_router

app = FastAPI(
    title="Project ASTRA Forensic API",
    description="Autonomous Threat Intelligence & Darknet De-Anonymization Engine (SIH 2026 - Problem 26151)",
    version=__version__
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(actors_router, prefix="/api/v1")
app.include_router(graph_router, prefix="/api/v1")
app.include_router(attribution_router, prefix="/api/v1")
app.include_router(infra_router, prefix="/api/v1")
app.include_router(evidence_router, prefix="/api/v1")
app.include_router(leads_router, prefix="/api/v1")
app.include_router(demo_router, prefix="/api/v1")
app.include_router(export_router, prefix="/api/v1")

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "OPERATIONAL",
        "engine": "ASTRA De-Anonymization Suite",
        "version": __version__,
        "legal_compliance": "Section 65B Indian Evidence Act / BSA 2023",
        "team": "Team BISHOP (SIH 2026)"
    }

from pathlib import Path
from fastapi.staticfiles import StaticFiles

frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")

