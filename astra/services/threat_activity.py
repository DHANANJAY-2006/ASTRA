from typing import List, Dict, Any
from pydantic import BaseModel
from astra.core.taxonomy import taxonomy_classifier

class ThreatClassification(BaseModel):
    text_snippet: str
    categories: List[str]
    primary_threat_head: str
    risk_level: str

class ThreatActivityService:
    def classify_activity(self, text: str) -> ThreatClassification:
        categories = taxonomy_classifier.classify(text)
        if not categories:
            categories = ["UNKNOWN_SUSPECT_ACTIVITY"]

        primary = categories[0]
        high_risk_heads = {"RANSOMWARE_EXPLOITS", "ILLICIT_WEAPONS", "DATABASE_LEAKS_PII"}
        medium_risk_heads = {"FINANCIAL_FRAUD_CARDING", "NARCOTICS_SYNTHETICS"}

        if any(c in high_risk_heads for c in categories):
            risk = "CRITICAL"
        elif any(c in medium_risk_heads for c in categories):
            risk = "HIGH"
        else:
            risk = "MEDIUM"

        return ThreatClassification(
            text_snippet=text[:120] + ("..." if len(text) > 120 else ""),
            categories=categories,
            primary_threat_head=primary,
            risk_level=risk
        )

threat_analyzer = ThreatActivityService()
