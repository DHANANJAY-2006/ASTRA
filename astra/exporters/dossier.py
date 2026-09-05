import json
from pathlib import Path
from typing import Dict, Any

from astra.core.evidence import ledger
from astra.core.models import DacsAttributionReport

class ForensicDossierExporter:
    """
    Generates structured forensic intelligence briefs and Section 65B compliance dossiers.
    """

    @staticmethod
    def export_json(report: DacsAttributionReport, output_path: Path) -> Path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        cert = ledger.generate_section_65b_certificate(case_reference=report.case_id)
        
        full_dossier = {
            "dossier_type": "ASTRA_FORENSIC_DE_ANONYMIZATION_BRIEF",
            "report": report.model_dump(),
            "section_65b_certificate": cert
        }
        
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(full_dossier, f, indent=2, default=str)
            
        return output_path

    @staticmethod
    def export_markdown(report: DacsAttributionReport, output_path: Path) -> Path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        cert = ledger.generate_section_65b_certificate(case_reference=report.case_id)

        md = f"""# 🛡️ ASTRA FORENSIC INTELLIGENCE DOSSIER
**Law Enforcement De-Anonymization Brief**  
*Produced by ASTRA Engine (Team BISHOP / SIH 2026)*

---

### 📋 Case Information
- **Case Reference ID**: `{report.case_id}`
- **Target Persona / Suspect Alias**: `{report.target_persona}`
- **Generated At**: `{report.generated_at.isoformat()}`
- **DACS Attribution Confidence**: **`{report.dacs_score}%`**
- **Forensic Verdict**: **`{report.attribution_verdict}`**

---

### 🏛️ Multi-Pillar Forensic Breakdown
| Pillar | Focus Area | Confidence Score |
| :--- | :--- | :--- |
| **P1: INFRA-SCAN** | Tor Misconfiguration & JARM Recon | `{report.pillar_scores.get('P1_INFRA_SCAN', 0.0):.2f}` |
| **P2: MGRD** | Marketplace Ghost Residue & PGP Correlation | `{report.pillar_scores.get('P2_MGRD', 0.0):.2f}` |
| **P3: CMTBP** | Crypto UTXO & Pre-Mixer Testing Rituals | `{report.pillar_scores.get('P3_CMTBP', 0.0):.2f}` |
| **P4: CAA** | Cognitive Argument Stylometry | `{report.pillar_scores.get('P4_CAA', 0.0):.2f}` |

---

### 🔍 Corroborated Evidence & Indicators
"""
        for item in report.key_findings:
            md += f"- {item}\n"

        md += f"""
---

### ⚖️ Evidentiary Admissibility (Section 65B Indian Evidence Act / BSA 2023)
- **Status**: `{cert['verification_status']}`
- **Cumulative SHA-256 Chain Anchor**: `{cert['cumulative_evidence_hash']}`
- **Evidence Blocks Verified**: `{cert['chain_records_count']}`
- **Statutory Declaration**:  
  > *"{cert['statutory_declaration']}"*

---
*CONFIDENTIAL - FOR AUTHORIZED LAW ENFORCEMENT & JUDICIAL USE ONLY*
"""
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(md)

        return output_path
