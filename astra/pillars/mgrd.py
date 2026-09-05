import hashlib
import re
from typing import List, Optional

from astra.core.evidence import ledger
from astra.core.models import MgrdResult, EvidenceType

class MgrdPillar:
    def __init__(self):
        self.name = "P2: MGRD"

    def normalize_pgp_fingerprint(self, raw_pgp_key: str) -> str:
        clean = re.sub(r"[^A-Fa-f0-9]", "", raw_pgp_key).upper()
        if len(clean) >= 16:
            return clean[-40:] if len(clean) >= 40 else clean[-16:]
        return hashlib.sha1(raw_pgp_key.encode()).hexdigest().upper()

    def analyze_migration_residue(
        self,
        persona_alias: str,
        known_forums: List[str],
        pgp_keys: List[str],
        seizure_date_delta_hours: Optional[float] = None,
        tox_or_jabber: Optional[str] = None
    ) -> MgrdResult:
        evidence_trail: List[str] = []
        score = 0.1

        normalized_keys = [self.normalize_pgp_fingerprint(k) for k in pgp_keys]
        unique_keys = set(normalized_keys)

        if len(pgp_keys) > 0:
            evidence_trail.append(f"Discovered {len(pgp_keys)} PGP public key artifact(s) for persona '{persona_alias}'")
            if len(unique_keys) == 1 and len(known_forums) > 1:
                score += 0.55
                evidence_trail.append(
                    f"CRITICAL: Exact PGP Key match ({list(unique_keys)[0]}) reused across multiple forums: {known_forums}"
                )
            elif len(unique_keys) > 1:
                score += 0.25
                evidence_trail.append(f"Multiple PGP keys observed ({len(unique_keys)} keys) across forums.")

        if len(known_forums) >= 2:
            score += 0.15
            evidence_trail.append(f"Persona presence verified across {len(known_forums)} distinct darknet markets: {known_forums}")

        if tox_or_jabber:
            score += 0.20
            evidence_trail.append(f"Direct secure contact handle linked to profile: {tox_or_jabber}")

        mirror_conf = 0.5
        if seizure_date_delta_hours is not None:
            if 0 < seizure_date_delta_hours <= 48:
                score += 0.20
                mirror_conf = 0.92
                evidence_trail.append(
                    f"HIGH: Fast migration reaction window ({seizure_date_delta_hours:.1f}h post-seizure) confirms active vendor relocation"
                )
            elif 48 < seizure_date_delta_hours <= 168:
                score += 0.10
                mirror_conf = 0.75
                evidence_trail.append(
                    f"Moderate migration reaction window ({seizure_date_delta_hours:.1f}h post-seizure)"
                )

        final_score = min(1.0, max(0.0, score))

        result = MgrdResult(
            persona_alias=persona_alias,
            correlated_forums=known_forums,
            pgp_fingerprints=list(unique_keys),
            temporal_reaction_window_hours=seizure_date_delta_hours,
            mirror_cluster_confidence=round(mirror_conf, 3),
            confidence_score=round(final_score, 3),
            evidence_trail=evidence_trail
        )

        ledger.record_evidence(
            evidence_type=EvidenceType.FORUM_DUMP,
            source_target=persona_alias,
            raw_bytes=result.model_dump_json().encode("utf-8"),
            metadata={"pillar": "P2_MGRD", "score": final_score}
        )

        return result

mgrd_analyzer = MgrdPillar()
