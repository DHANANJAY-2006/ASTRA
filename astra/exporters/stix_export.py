import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List

from astra.core.models import DacsAttributionReport

class Stix21Exporter:
    @staticmethod
    def generate_bundle(report: DacsAttributionReport) -> Dict[str, Any]:
        bundle_id = f"bundle--{uuid.uuid4()}"
        now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

        threat_actor_id = f"threat-actor--{uuid.uuid4()}"
        report_id = f"report--{uuid.uuid4()}"

        objects: List[Dict[str, Any]] = [
            {
                "type": "threat-actor",
                "spec_version": "2.1",
                "id": threat_actor_id,
                "created": now_iso,
                "modified": now_iso,
                "name": report.target_persona,
                "threat_actor_types": ["darknet-vendor", "cybercriminal"],
                "description": f"Attributed darknet actor: DACS {report.dacs_score}%.",
                "confidence": int(report.dacs_score),
                "labels": ["dark-web", "sih2026", "de-anonymized"],
                "custom_properties": {
                    "x_astra_case_id": report.case_id,
                    "x_astra_chain_hash": report.chain_of_custody_hash
                }
            },
            {
                "type": "report",
                "spec_version": "2.1",
                "id": report_id,
                "created": now_iso,
                "modified": now_iso,
                "name": f"ASTRA Attribution Dossier: {report.target_persona}",
                "description": report.forensic_notes,
                "published": now_iso,
                "object_refs": [threat_actor_id],
                "confidence": int(report.dacs_score),
                "labels": ["forensic-investigation", "de-anonymization"]
            }
        ]

        for finding in report.key_findings:
            ind_id = f"indicator--{uuid.uuid4()}"
            objects.append({
                "type": "indicator",
                "spec_version": "2.1",
                "id": ind_id,
                "created": now_iso,
                "modified": now_iso,
                "name": "Darknet Attribution Indicator",
                "pattern": f"[x-darknet-event:description = '{finding}']",
                "pattern_type": "stix",
                "valid_from": now_iso,
                "confidence": int(report.dacs_score)
            })
            objects.append({
                "type": "relationship",
                "spec_version": "2.1",
                "id": f"relationship--{uuid.uuid4()}",
                "created": now_iso,
                "modified": now_iso,
                "relationship_type": "indicates",
                "source_ref": ind_id,
                "target_ref": threat_actor_id
            })

        return {
            "type": "bundle",
            "id": bundle_id,
            "objects": objects
        }
