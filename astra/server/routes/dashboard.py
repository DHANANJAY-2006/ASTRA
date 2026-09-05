import json
from pathlib import Path
from fastapi import APIRouter
from astra.services.attribution_pipeline import attribution_pipeline
from astra.core.evidence import ledger

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats():
    actors = attribution_pipeline.run_attribution()
    personas = attribution_pipeline.load_personas()
    txs = attribution_pipeline.load_transactions()
    chain_status = ledger.verify_chain_integrity()

    wallets = set()
    for a in actors:
        wallets.update(a.wallets)

    onions = set()
    for a in actors:
        onions.update(a.onion_addresses)

    high_conf = [a for a in actors if a.dacs_score >= 80.0]

    return {
        "active_actors_count": len(actors),
        "tracked_personas_count": len(personas),
        "identified_wallets_count": len(wallets),
        "monitored_hidden_services_count": len(onions),
        "high_confidence_attributions": len(high_conf),
        "evidence_blocks_count": chain_status.get("total_records", 0),
        "chain_integrity_valid": chain_status.get("valid", True),
        "latest_block_hash": chain_status.get("latest_block_hash", "0"*64),
        "four_pillars": {
            "p1_infra_scan": "ACTIVE",
            "p2_mgrd": "ACTIVE",
            "p3_cmtbp": "ACTIVE",
            "p4_caa": "ACTIVE"
        }
    }

@router.get("/alerts")
def get_dashboard_alerts():
    actors = attribution_pipeline.run_attribution()
    alerts = []
    for a in actors:
        if a.dacs_score >= 80.0:
            alerts.append({
                "id": f"ALERT-{a.actor_id}",
                "level": "CRITICAL",
                "actor_id": a.actor_id,
                "title": f"Deterministic Attribution Confirmed: {a.primary_alias}",
                "message": f"DACS score reached {a.dacs_score:.1f}% linking {len(a.aliases)} darknet aliases across marketplaces.",
                "timestamp": "2026-03-05T18:30:00Z"
            })
        elif a.dacs_score >= 60.0:
            alerts.append({
                "id": f"ALERT-{a.actor_id}",
                "level": "HIGH",
                "actor_id": a.actor_id,
                "title": f"Multi-Signal Correlation Emerging: {a.primary_alias}",
                "message": f"DACS score {a.dacs_score:.1f}% with partial on-chain and stylometric corroboration.",
                "timestamp": "2026-03-05T18:25:00Z"
            })
    return alerts
