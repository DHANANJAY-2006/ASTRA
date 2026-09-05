from fastapi import APIRouter
from astra.core.evidence import ledger

router = APIRouter(prefix="/evidence", tags=["evidence"])

@router.get("/verify")
def verify_evidence_chain():
    return ledger.verify_chain_integrity()

@router.get("/certificate/{actor_id}")
def generate_actor_certificate(actor_id: str):
    return ledger.generate_section_65b_certificate(
        case_id=actor_id,
        investigator_name="Cyber Forensics Unit (SIH 2026 / Team BISHOP)"
    )
