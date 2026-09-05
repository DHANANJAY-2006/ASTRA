from astra.dacs.engine import DacsScoringEngine
from astra.core.models import (
    InfraScanResult,
    MgrdResult,
    CmtbpResult,
    CaaResult
)

def test_dacs_high_attribution():
    engine = DacsScoringEngine()

    p1 = InfraScanResult(target="t.onion", confidence_score=0.85, indicators=["IP leaked"])
    p2 = MgrdResult(persona_alias="vendor", mirror_cluster_confidence=0.9, confidence_score=0.90)
    p3 = CmtbpResult(wallet_address="bc1...", confidence_score=0.80)
    p4 = CaaResult(sample_id="test", author_similarity_score=0.85, confidence_score=0.85)

    report = engine.fuse_signals("CASE-001", "vendor", p1, p2, p3, p4)
    assert report.dacs_score >= 85.0
    assert "HIGH CONFIDENCE" in report.attribution_verdict
    assert len(report.key_findings) > 0

def test_dacs_single_signal_penalty():
    engine = DacsScoringEngine()

    p1 = InfraScanResult(target="t.onion", confidence_score=0.80)
    report = engine.fuse_signals("CASE-002", "solitary_actor", infra_result=p1)

    assert report.dacs_score < 25.0
    assert "INSUFFICIENT" in report.attribution_verdict
