from pathlib import Path
from datetime import datetime, timezone

from astra.core.models import DacsAttributionReport
from astra.visualization.graph_builder import ForensicGraphBuilder

def test_graph_builder_render(tmp_path: Path):
    report = DacsAttributionReport(
        case_id="TEST-CASE-GRAPH",
        target_persona="AlphaTarget",
        generated_at=datetime.now(timezone.utc),
        dacs_score=94.0,
        attribution_verdict="HIGH CONFIDENCE",
        pillar_scores={"P1_INFRA_SCAN": 0.95, "P2_MGRD": 0.9, "P3_CMTBP": 0.9, "P4_CAA": 0.8},
        chain_of_custody_hash="1122334455667788",
        evidence_count=10,
        key_findings=["Finding A", "Finding B"],
        forensic_notes="Notes"
    )

    out_file = tmp_path / "test_graph.html"
    ForensicGraphBuilder.render_html(report, out_file)

    assert out_file.exists()
    content = out_file.read_text(encoding="utf-8")
    assert "PROJECT ASTRA" in content
    assert "AlphaTarget" in content
    assert "d3.forceSimulation" in content
    assert "TEST-CASE-GRAPH" in content
