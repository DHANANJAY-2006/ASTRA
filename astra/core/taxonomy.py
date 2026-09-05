from typing import List, Dict, Set

TAXONOMY_RULES: Dict[str, Set[str]] = {
    "FINANCIAL_FRAUD_CARDING": {
        "cvv", "dumps", "credit card", "bank logs", "stripe", "fullz", "paypal", "cashout", "atm", "bins"
    },
    "DATABASE_LEAKS_PII": {
        "aadhaar", "pan card", "database leak", "sql dump", "kyc", "passport", "telecom leak", "voter id"
    },
    "RANSOMWARE_EXPLOITS": {
        "ransomware", "0day", "exploit", "cve", "rat", "loader", "stealer", "botnet", "source code", "rce"
    },
    "NARCOTICS_SYNTHETICS": {
        "fentanyl", "meth", "cocaine", "weed", "lsd", "mdma", "pills", "cartel", "stealth packaging"
    },
    "ILLICIT_WEAPONS": {
        "glock", "ammunition", "pistol", "suppressor", "firearm", "ar15", "ghost gun"
    }
}

class ThreatActivityClassifier:
    @staticmethod
    def classify(text_content: str) -> List[str]:
        lowered = text_content.lower()
        matched = []
        for category, keywords in TAXONOMY_RULES.items():
            if any(k in lowered for k in keywords):
                matched.append(category)
        return matched if matched else ["GENERAL_DARKNET_COMMERCE"]

taxonomy_classifier = ThreatActivityClassifier()
