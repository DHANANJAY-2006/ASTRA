import json
from pathlib import Path
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from astra.services.attribution_pipeline import attribution_pipeline, PersonaRecord

router = APIRouter(prefix="/leads", tags=["leads"])

class LeadInput(BaseModel):
    username: str
    platform: str
    sample_text: str
    wallet: Optional[str] = None
    pgp_key: Optional[str] = None
    onion_address: Optional[str] = None
    email: Optional[str] = None

@router.post("")
def submit_lead(lead: LeadInput):
    personas_file = Path("./data/personas.json")
    personas = []
    if personas_file.exists():
        try:
            with open(personas_file, "r", encoding="utf-8") as f:
                personas = json.load(f)
        except Exception:
            personas = []

    new_record = lead.model_dump()
    new_record["vouched_by"] = []
    personas.append(new_record)

    with open(personas_file, "w", encoding="utf-8") as f:
        json.dump(personas, f, indent=2)

    actors = attribution_pipeline.run_attribution()
    matched_actor = next((a for a in actors if any(al["username"] == lead.username for al in a.aliases)), None)

    return {
        "status": "INGESTED_AND_ATTRIBUTED",
        "lead_username": lead.username,
        "platform": lead.platform,
        "assigned_actor_id": matched_actor.actor_id if matched_actor else None,
        "dacs_score": matched_actor.dacs_score if matched_actor else 0.0,
        "total_active_actors": len(actors)
    }
