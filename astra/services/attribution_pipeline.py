import json
from pathlib import Path
from typing import List, Dict, Any, Set, Tuple, Optional
from pydantic import BaseModel, Field

from astra.pillars.caa import caa_profiler
from astra.pillars.cmtbp import cluster_wallets_by_common_input, cmtbp_tracer
from astra.pillars.mgrd import mgrd_analyzer
from astra.pillars.infra_scan import infra_scanner
from astra.dacs.engine import dacs_engine
from astra.core.models import DacsAttributionReport
from astra.services.entity_linkage import entity_linker, RealWorldEntityLink

class PersonaRecord(BaseModel):
    username: str
    platform: str
    sample_text: str
    wallet: Optional[str] = None
    pgp_key: Optional[str] = None
    onion_address: Optional[str] = None
    email: Optional[str] = None
    vouched_by: List[str] = Field(default_factory=list)

class AttributionEdge(BaseModel):
    source_username: str
    source_platform: str
    target_username: str
    target_platform: str
    edge_type: str
    weight: float
    description: str

class DeAnonymizedActor(BaseModel):
    actor_id: str
    primary_alias: str
    aliases: List[Dict[str, str]]
    wallets: List[str]
    pgp_keys: List[str]
    onion_addresses: List[str]
    emails: List[str]
    dacs_score: float
    attribution_verdict: str
    edges: List[AttributionEdge]
    real_world_entities: List[RealWorldEntityLink]
    chain_hash: str

class AttributionPipeline:
    def __init__(self, personas_file: Optional[Path] = None, tx_file: Optional[Path] = None):
        self.personas_file = personas_file or Path("./data/personas.json")
        self.tx_file = tx_file or Path("./data/wallet_transactions.json")

    def load_personas(self) -> List[PersonaRecord]:
        if not self.personas_file.exists():
            return []
        with open(self.personas_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [PersonaRecord(**item) for item in data]

    def load_transactions(self) -> List[Dict[str, Any]]:
        if not self.tx_file.exists():
            return []
        with open(self.tx_file, "r", encoding="utf-8") as f:
            return json.load(f)

    def run_attribution(self) -> List[DeAnonymizedActor]:
        personas = self.load_personas()
        transactions = self.load_transactions()
        wallet_clusters = cluster_wallets_by_common_input(transactions)

        parent: Dict[Tuple[str, str], Tuple[str, str]] = {}
        def find(p: Tuple[str, str]) -> Tuple[str, str]:
            parent.setdefault(p, p)
            while parent[p] != p:
                parent[p] = parent[parent[p]]
                p = parent[p]
            return p

        def union(p1: Tuple[str, str], p2: Tuple[str, str]):
            r1, r2 = find(p1), find(p2)
            if r1 != r2:
                parent[r1] = r2

        edges: List[AttributionEdge] = []
        n = len(personas)

        for i in range(n):
            p1 = personas[i]
            k1 = (p1.username, p1.platform)
            find(k1)
            for j in range(i + 1, n):
                p2 = personas[j]
                k2 = (p2.username, p2.platform)
                find(k2)

                if p1.wallet and p2.wallet:
                    if p1.wallet == p2.wallet:
                        union(k1, k2)
                        edges.append(AttributionEdge(
                            source_username=p1.username,
                            source_platform=p1.platform,
                            target_username=p2.username,
                            target_platform=p2.platform,
                            edge_type="SHARED_WALLET",
                            weight=1.0,
                            description=f"Exact wallet address reuse: {p1.wallet}"
                        ))
                    else:
                        for cluster in wallet_clusters:
                            if p1.wallet in cluster and p2.wallet in cluster:
                                union(k1, k2)
                                edges.append(AttributionEdge(
                                    source_username=p1.username,
                                    source_platform=p1.platform,
                                    target_username=p2.username,
                                    target_platform=p2.platform,
                                    edge_type="COMMON_INPUT_WALLET_CLUSTER",
                                    weight=0.9,
                                    description="Wallets co-spent in single UTXO input script"
                                ))

                if p1.pgp_key and p2.pgp_key and p1.pgp_key == p2.pgp_key:
                    union(k1, k2)
                    edges.append(AttributionEdge(
                        source_username=p1.username,
                        source_platform=p1.platform,
                        target_username=p2.username,
                        target_platform=p2.platform,
                        edge_type="SHARED_PGP_KEY",
                        weight=0.95,
                        description=f"Cryptographic PGP public key fingerprint match: {p1.pgp_key}"
                    ))

                if p1.sample_text and p2.sample_text:
                    sim = caa_profiler.compare_samples(p1.sample_text, p2.sample_text).author_similarity_score
                    if sim >= 0.88:
                        union(k1, k2)
                        edges.append(AttributionEdge(
                            source_username=p1.username,
                            source_platform=p1.platform,
                            target_username=p2.username,
                            target_platform=p2.platform,
                            edge_type="CAA_BURROWS_DELTA_MATCH",
                            weight=round(sim, 3),
                            description=f"Burrows' Delta stylometric writeprint similarity ({sim*100:.1f}%)"
                        ))

        groups: Dict[Tuple[str, str], List[PersonaRecord]] = {}
        for p in personas:
            root = find((p.username, p.platform))
            groups.setdefault(root, []).append(p)

        actors: List[DeAnonymizedActor] = []
        idx = 1
        for root, cluster_personas in groups.items():
            primary = cluster_personas[0].username
            actor_id = f"ASTRA-ACTOR-{idx:03d}"
            idx += 1

            aliases = [{"username": p.username, "platform": p.platform} for p in cluster_personas]
            wallets = list({p.wallet for p in cluster_personas if p.wallet})
            pgp_keys = list({p.pgp_key for p in cluster_personas if p.pgp_key})
            onions = list({p.onion_address for p in cluster_personas if p.onion_address})
            emails = list({p.email for p in cluster_personas if p.email})

            cluster_edges = [
                e for e in edges
                if any(e.source_username == p.username and e.source_platform == p.platform for p in cluster_personas)
                and any(e.target_username == p.username and e.target_platform == p.platform for p in cluster_personas)
            ]

            sample_texts = [p.sample_text for p in cluster_personas if p.sample_text]
            text_a = sample_texts[0] if sample_texts else "sample a"
            text_b = sample_texts[1] if len(sample_texts) > 1 else text_a

            mock_infra = {
                "san_list": [onions[0] if onions else f"{primary}.onion", "auth.vektor-ops.ru", "185.220.101.5"],
                "leaked_ips": ["185.220.101.5"] if len(cluster_personas) > 1 else [],
                "open_ports": [80, 443, 22]
            }
            infra_res = infra_scanner.scan_target(onions[0] if onions else f"{primary}.onion", mock_data=mock_infra)

            mgrd_res = mgrd_analyzer.analyze_migration_residue(
                persona_alias=primary,
                known_forums=[p.platform for p in cluster_personas],
                pgp_keys=pgp_keys,
                seizure_date_delta_hours=24.5 if len(cluster_personas) > 1 else None,
                tox_or_jabber=emails[0] if emails else None
            )

            tx_subset = [tx for tx in transactions if any(w in tx.get("inputs", []) for w in wallets)]
            cmtbp_res = cmtbp_tracer.analyze_wallet_transactions(
                wallet_address=wallets[0] if wallets else "bc1qdemo000",
                transactions=tx_subset or transactions
            )

            caa_res = caa_profiler.compare_samples(text_a, text_b, sample_id=f"CAA_{actor_id}")

            dacs_report: DacsAttributionReport = dacs_engine.fuse_signals(
                case_id=actor_id,
                target_persona=primary,
                infra_result=infra_res,
                mgrd_result=mgrd_res,
                cmtbp_result=cmtbp_res,
                caa_result=caa_res
            )

            real_entities = entity_linker.link_actor_entities(
                actor_alias=primary,
                emails=emails,
                san_domains=infra_res.ssl_san_list,
                leaked_ips=infra_res.leaked_clearnet_ips
            )

            actors.append(DeAnonymizedActor(
                actor_id=actor_id,
                primary_alias=primary,
                aliases=aliases,
                wallets=wallets,
                pgp_keys=pgp_keys,
                onion_addresses=onions,
                emails=emails,
                dacs_score=dacs_report.dacs_score,
                attribution_verdict=dacs_report.attribution_verdict,
                edges=cluster_edges,
                real_world_entities=real_entities,
                chain_hash=dacs_report.chain_of_custody_hash
            ))

        return actors

attribution_pipeline = AttributionPipeline()
