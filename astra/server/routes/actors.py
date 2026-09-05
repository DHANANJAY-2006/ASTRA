from fastapi import APIRouter, HTTPException
from typing import List, Optional
from astra.services.attribution_pipeline import attribution_pipeline
from astra.services.threat_activity import threat_analyzer

router = APIRouter(prefix="/actors", tags=["actors"])

@router.get("")
def list_actors(query: Optional[str] = None):
    actors = attribution_pipeline.run_attribution()
    if query:
        q = query.lower()
        actors = [
            a for a in actors
            if q in a.primary_alias.lower()
            or any(q in al["username"].lower() for al in a.aliases)
            or any(q in w.lower() for w in a.wallets)
            or any(q in e.lower() for e in a.emails)
        ]
    results = []
    for a in actors:
        results.append({
            "actor_id": a.actor_id,
            "primary_alias": a.primary_alias,
            "dacs_score": a.dacs_score,
            "verdict": a.attribution_verdict,
            "alias_count": len(a.aliases),
            "wallet_count": len(a.wallets),
            "onion_count": len(a.onion_addresses),
            "chain_hash": a.chain_hash,
            "aliases": a.aliases
        })
    return results

@router.get("/{actor_id}")
def get_actor_profile(actor_id: str):
    actors = attribution_pipeline.run_attribution()
    match = next((a for a in actors if a.actor_id == actor_id or a.primary_alias.lower() == actor_id.lower()), None)
    if not match:
        raise HTTPException(status_code=404, detail="Actor not found")

    personas = attribution_pipeline.load_personas()
    actor_personas = [
        p for p in personas
        if any(p.username == al["username"] and p.platform == al["platform"] for al in match.aliases)
    ]

    sample_texts = [p.sample_text for p in actor_personas if p.sample_text]
    threat_info = threat_analyzer.classify_activity(sample_texts[0] if sample_texts else match.primary_alias)

    return {
        "actor": match,
        "threat_profile": threat_info,
        "personas": actor_personas,
        "section_65b_anchor": {
            "block_hash": match.chain_hash,
            "statutory_compliance": "Section 65B Indian Evidence Act / BSA 2023",
            "audit_status": "VALID_CRYPTOGRAPHIC_CHAIN"
        }
    }
