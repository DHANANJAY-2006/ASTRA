import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class RealWorldEntityLink(BaseModel):
    entity_name: str
    entity_type: str
    relationship_type: str
    confidence: str
    evidence_detail: Dict[str, Any] = Field(default_factory=dict)
    source: str
    explanation: str

class EntityLinkageService:
    def __init__(self, breach_data_path: Optional[Path] = None):
        self.breach_data_path = breach_data_path or Path("./data/breach_records.json")
        self._breach_cache: List[Dict[str, Any]] = []
        self._load_breach_cache()

    def _load_breach_cache(self):
        if self.breach_data_path.exists():
            try:
                with open(self.breach_data_path, "r", encoding="utf-8") as f:
                    self._breach_cache = json.load(f)
            except Exception:
                self._breach_cache = []

    def link_actor_entities(
        self,
        actor_alias: str,
        emails: List[str],
        san_domains: List[str],
        leaked_ips: List[str]
    ) -> List[RealWorldEntityLink]:
        links: List[RealWorldEntityLink] = []

        for domain in san_domains:
            if not domain.endswith(".onion") and "." in domain:
                links.append(
                    RealWorldEntityLink(
                        entity_name=domain,
                        entity_type="domain",
                        relationship_type="cert_san_clearnet_leak",
                        confidence="high",
                        evidence_detail={"domain": domain, "actor": actor_alias},
                        source="P1_INFRA_SCAN",
                        explanation=f"TLS certificate Subject Alternative Name directly exposes clearnet host '{domain}'."
                    )
                )

        for ip in leaked_ips:
            links.append(
                RealWorldEntityLink(
                    entity_name=ip,
                    entity_type="ipv4",
                    relationship_type="infrastructure_egress",
                    confidence="high",
                    evidence_detail={"ip": ip, "actor": actor_alias},
                    source="P1_INFRA_SCAN",
                    explanation=f"Direct clearnet backend IP address uncovered via TLS misconfiguration."
                )
            )

        for email in emails:
            for rec in self._breach_cache:
                if rec.get("email", "").lower() == email.lower():
                    breaches = rec.get("breaches", [])
                    real_name = rec.get("suspect_real_name")
                    clearnet_domain = rec.get("associated_clearnet_domain")

                    if breaches:
                        links.append(
                            RealWorldEntityLink(
                                entity_name=f"Breach records ({', '.join(breaches)})",
                                entity_type="breach_catalog",
                                relationship_type="email_compromise_cluster",
                                confidence="high",
                                evidence_detail={"email": email, "breaches": breaches},
                                source="HIBP_OSINT",
                                explanation=f"Darknet contact email matched across {len(breaches)} public breach dumps."
                            )
                        )
                    if real_name:
                        links.append(
                            RealWorldEntityLink(
                                entity_name=real_name,
                                entity_type="suspect_individual",
                                relationship_type="breach_identity_correlation",
                                confidence="medium",
                                evidence_detail={"email": email, "real_name": real_name, "country": rec.get("country")},
                                source="BREACH_RECORDS",
                                explanation=f"Compromised credential dump associates darknet alias email with suspect name '{real_name}'."
                            )
                        )
                    if clearnet_domain:
                        links.append(
                            RealWorldEntityLink(
                                entity_name=clearnet_domain,
                                entity_type="organization_domain",
                                relationship_type="clearnet_infrastructure_link",
                                confidence="high",
                                evidence_detail={"domain": clearnet_domain, "asn": rec.get("asn")},
                                source="OSINT_CORRELATION",
                                explanation=f"Actor email correlates to registered registrar domain '{clearnet_domain}'."
                            )
                        )

        return links

entity_linker = EntityLinkageService()
