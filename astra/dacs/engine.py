import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional

from astra.config import config
from astra.core.evidence import ledger
from astra.core.models import (
    DacsAttributionReport,
    InfraScanResult,
    MgrdResult,
    CmtbpResult,
    CaaResult
)

class DacsScoringEngine:
    """
    Deterministic Attribution Confidence Score (DACS) Fusion Engine.
    Combines multi-modal evidence across the 4 specialized pillars into a unified,
    deterministic attribution percentage (0 - 100%) for law enforcement decision-making.
    """

    def __init__(
        self,
        w_infra: Optional[float] = None,
        w_mgrd: Optional[float] = None,
        w_cmtbp: Optional[float] = None,
        w_caa: Optional[float] = None
    ):
        self.w_infra = w_infra or config.weight_p1_infra
        self.w_mgrd = w_mgrd or config.weight_p2_mgrd
        self.w_cmtbp = w_cmtbp or config.weight_p3_cmtbp
        self.w_caa = w_caa or config.weight_p4_caa

        total = self.w_infra + self.w_mgrd + self.w_cmtbp + self.w_caa
        # Normalize weights to sum to 1.0
        self.w_infra /= total
        self.w_mgrd /= total
        self.w_cmtbp /= total
        self.w_caa /= total

    def fuse_signals(
        self,
        case_id: str,
        target_persona: str,
        infra_result: Optional[InfraScanResult] = None,
        mgrd_result: Optional[MgrdResult] = None,
        cmtbp_result: Optional[CmtbpResult] = None,
        caa_result: Optional[CaaResult] = None
    ) -> DacsAttributionReport:
        """
        Executes deterministic multi-signal fusion and generates the final evidentiary brief.
        """
        pillar_scores: Dict[str, float] = {
            "P1_INFRA_SCAN": infra_result.confidence_score if infra_result else 0.0,
            "P2_MGRD": mgrd_result.confidence_score if mgrd_result else 0.0,
            "P3_CMTBP": cmtbp_result.confidence_score if cmtbp_result else 0.0,
            "P4_CAA": caa_result.confidence_score if caa_result else 0.0
        }

        # 1. Base Weighted Score (0.0 to 1.0)
        base_score = (
            self.w_infra * pillar_scores["P1_INFRA_SCAN"] +
            self.w_mgrd * pillar_scores["P2_MGRD"] +
            self.w_cmtbp * pillar_scores["P3_CMTBP"] +
            self.w_caa * pillar_scores["P4_CAA"]
        )

        # 2. Multi-Modal Corroboration Heuristic
        # If 3 or more independent evidence pillars register high confidence (>= 0.65),
        # apply an inter-agency corroboration boost (+10% to +15%)
        high_signals = sum(1 for score in pillar_scores.values() if score >= 0.65)
        boost = 0.0
        if high_signals >= 3:
            boost = 0.12
        elif high_signals == 2:
            boost = 0.05

        # 3. Penalty for single-signal skew (stops false-positive bottlenecks)
        active_signals = sum(1 for score in pillar_scores.values() if score > 0.05)
        penalty = 0.0
        if active_signals <= 1:
            penalty = 0.15  # Cannot achieve high attribution from a solitary signal alone

        final_composite = max(0.0, min(1.0, base_score + boost - penalty))
        dacs_percentage = round(final_composite * 100.0, 1)

        # Determine forensic verdict
        if dacs_percentage >= 85.0:
            verdict = "HIGH CONFIDENCE ATTRIBUTION (SECTION 65B COURT ADMISSIBLE)"
        elif dacs_percentage >= 65.0:
            verdict = "PROBABLE ATTRIBUTION (ACTIONABLE LEA TARGETING)"
        elif dacs_percentage >= 40.0:
            verdict = "CORROBORATIVE INTELLIGENCE (REQUIRES ADDITIONAL EVIDENCE)"
        else:
            verdict = "INSUFFICIENT ATTRIBUTION EVIDENCE"

        # Compile Key Findings
        findings: List[str] = []
        if infra_result and infra_result.indicators:
            findings.extend([f"[P1] {ind}" for ind in infra_result.indicators[:2]])
        if mgrd_result and mgrd_result.evidence_trail:
            findings.extend([f"[P2] {tr}" for tr in mgrd_result.evidence_trail[:2]])
        if cmtbp_result and cmtbp_result.flagged_patterns:
            findings.extend([f"[P3] {pat}" for pat in cmtbp_result.flagged_patterns[:2]])
        if caa_result:
            findings.append(
                f"[P4] Stylometric cognitive similarity index: {caa_result.author_similarity_score:.2f}"
            )

        # Verify chain of custody status
        chain_status = ledger.verify_chain_integrity()
        chain_hash = chain_status.get("latest_block_hash", "UNKNOWN")
        evidence_count = chain_status.get("total_records", 0)

        notes = (
            f"DACS Multi-Signal Fusion calculated for case '{case_id}' regarding persona '{target_persona}'. "
            f"Active pillars: {active_signals}/4. Multi-modal corroboration boost: +{boost*100:.0f}%. "
            f"Single-signal penalty: -{penalty*100:.0f}%."
        )

        return DacsAttributionReport(
            case_id=case_id,
            target_persona=target_persona,
            generated_at=datetime.now(timezone.utc),
            dacs_score=dacs_percentage,
            attribution_verdict=verdict,
            pillar_scores=pillar_scores,
            chain_of_custody_hash=chain_hash,
            evidence_count=evidence_count,
            key_findings=findings,
            forensic_notes=notes
        )

# Global singleton engine
dacs_engine = DacsScoringEngine()
