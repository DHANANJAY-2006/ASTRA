import json
from pathlib import Path
from datetime import datetime, timezone
import pytest

from astra.core.models import DacsAttributionReport
from astra.exporters.stix_export import Stix21Exporter
from astra.exporters.dossier import ForensicDossierExporter

def test_stix_export():
    report = DacsAttributionReport(
        case_id="CASE-STIX-01",
        target_persona="ShadowTrader",
        generated_at=datetime.now(timezone.utc),
        dacs_score=92.5,
        attribution_verdict="HIGH CONFIDENCE",
        pillar_scores={"P1_INFRA_SCAN": 0.9, "P2_MGRD": 0.9, "P3_CMTBP": 0.9, "P4_CAA": 0.9},
        chain_of_custody_hash="abcd1234ef",
        evidence_count=4,
        key_findings=["Tor SAN leak to clearnet IP", "PGP reused across 3 markets"],
        forensic_notes="Tested note"
    )

    bundle = Stix21Exporter.generate_bundle(report)
    assert bundle["type"] == "bundle"
    assert len(bundle["objects"]) >= 2
    types = [obj["type"] for obj in bundle["objects"]]
    assert "threat-actor" in types
    assert "report" in types
    assert "indicator" in types

def test_dossier_export(tmp_path: Path):
    report = DacsAttributionReport(
        case_id="CASE-DOSSIER-01",
        target_persona="GhostBroker",
        generated_at=datetime.now(timezone.utc),
        dacs_score=88.0,
        attribution_verdict="HIGH CONFIDENCE",
        pillar_scores={"P1_INFRA_SCAN": 0.88},
        chain_of_custody_hash="1234abcd",
        evidence_count=2,
        key_findings=["Finding 1"],
        forensic_notes="Notes"
    )

    json_file = tmp_path / "dossier.json"
    md_file = tmp_path / "dossier.md"

    ForensicDossierExporter.export_json(report, json_file)
    ForensicDossierExporter.export_markdown(report, md_file)

    assert json_file.exists()
    assert md_file.exists()

    dossier_data = json.loads(json_file.read_text(encoding="utf-8"))
    assert dossier_data["dossier_type"] == "ASTRA_FORENSIC_DE_ANONYMIZATION_BRIEF"
    assert "section_65b_certificate" in dossier_data

    md_content = md_file.read_text(encoding="utf-8")
    assert "ASTRA FORENSIC INTELLIGENCE DOSSIER" in md_content
    assert "GhostBroker" in md_content
