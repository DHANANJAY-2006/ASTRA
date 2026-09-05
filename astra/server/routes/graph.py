from fastapi import APIRouter, HTTPException
from typing import Optional, Dict, Any, List
from astra.services.attribution_pipeline import attribution_pipeline

router = APIRouter(prefix="/graph", tags=["graph"])

@router.get("")
def get_investigation_graph(actor_id: Optional[str] = None) -> Dict[str, Any]:
    actors = attribution_pipeline.run_attribution()
    if actor_id:
        actors = [a for a in actors if a.actor_id == actor_id or a.primary_alias.lower() == actor_id.lower()]
        if not actors:
            raise HTTPException(status_code=404, detail="Actor not found")

    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    seen_nodes = set()

    def add_node(node_id: str, label: str, node_type: str, details: Dict[str, Any] = None):
        if node_id not in seen_nodes:
            seen_nodes.add(node_id)
            nodes.append({
                "id": node_id,
                "label": label,
                "type": node_type,
                "details": details or {}
            })

    def add_edge(src: str, tgt: str, label: str, edge_type: str, weight: float = 1.0):
        edges.append({
            "source": src,
            "target": tgt,
            "label": label,
            "type": edge_type,
            "weight": weight
        })

    for a in actors:
        actor_node_id = f"actor_{a.actor_id}"
        add_node(
            actor_node_id,
            f"ACTOR: {a.primary_alias}",
            "actor",
            {"dacs_score": a.dacs_score, "verdict": a.attribution_verdict}
        )

        for alias in a.aliases:
            handle_id = f"handle_{alias['platform']}_{alias['username']}"
            add_node(
                handle_id,
                f"{alias['username']} ({alias['platform']})",
                "handle",
                {"platform": alias["platform"], "username": alias["username"]}
            )
            add_edge(actor_node_id, handle_id, "ALIASED_AS", "ALIAS", 1.0)

        for w in a.wallets:
            w_id = f"wallet_{w}"
            add_node(w_id, f"BTC: {w[:10]}...", "wallet", {"address": w})
            add_edge(actor_node_id, w_id, "USES_WALLET", "FINANCIAL", 0.95)

        for pgp in a.pgp_keys:
            pgp_id = f"pgp_{pgp.replace(' ', '')}"
            add_node(pgp_id, f"PGP: {pgp[:12]}...", "pgp", {"fingerprint": pgp})
            add_edge(actor_node_id, pgp_id, "USES_KEY", "CRYPTOGRAPHIC", 0.98)

        for onion in a.onion_addresses:
            onion_id = f"onion_{onion}"
            add_node(onion_id, onion, "onion", {"url": onion})
            add_edge(actor_node_id, onion_id, "HOSTS_SERVICE", "INFRASTRUCTURE", 0.9)

        for entity in a.real_world_entities:
            ent_id = f"entity_{entity.entity_name}"
            ntype = "ip" if entity.entity_type == "ipv4" else ("breach" if "breach" in entity.entity_type else "domain")
            add_node(
                ent_id,
                entity.entity_name,
                ntype,
                {"explanation": entity.explanation, "confidence": entity.confidence, "source": entity.source}
            )
            add_edge(actor_node_id, ent_id, entity.relationship_type, "REAL_WORLD_LINK", 0.85)

        anchor_id = f"sec65b_{a.actor_id}"
        add_node(
            anchor_id,
            f"Sec 65B Anchor: {a.chain_hash[:8]}...",
            "evidence_anchor",
            {"hash": a.chain_hash, "standard": "Section 65B BSA 2023"}
        )
        add_edge(actor_node_id, anchor_id, "EVIDENTIARY_HASH_ANCHOR", "LEGAL", 1.0)

        for e in a.edges:
            src = f"handle_{e.source_platform}_{e.source_username}"
            tgt = f"handle_{e.target_platform}_{e.target_username}"
            if src in seen_nodes and tgt in seen_nodes:
                add_edge(src, tgt, e.edge_type, "CORRELATION", e.weight)

    return {
        "nodes": nodes,
        "edges": edges,
        "total_nodes": len(nodes),
        "total_edges": len(edges)
    }
