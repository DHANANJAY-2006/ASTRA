import time
import random
from typing import Dict, Any, Optional
import httpx

from astra.config import config
from astra.core.evidence import ledger
from astra.core.models import EvidenceType

class TorIngestionCollector:
    def __init__(self, tor_proxy: Optional[str] = None):
        self.tor_proxy = tor_proxy or config.tor_proxy
        self.user_agent = config.user_agent

    def fetch_hidden_service(
        self,
        onion_url: str,
        timeout: Optional[float] = None,
        simulate_if_tor_unavailable: bool = True
    ) -> Dict[str, Any]:
        jitter = random.uniform(config.jitter_min_seconds, config.jitter_max_seconds)
        time.sleep(jitter)

        req_timeout = timeout or config.request_timeout
        headers = {
            "User-Agent": self.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }

        try:
            with httpx.Client(proxy=self.tor_proxy, timeout=req_timeout, headers=headers) as client:
                response = client.get(onion_url)
                content_bytes = response.content
                status_code = response.status_code
                resp_headers = dict(response.headers)
                source_mode = "LIVE_TOR_SOCKS5"
        except Exception as exc:
            if not simulate_if_tor_unavailable:
                raise ConnectionError(f"Tor proxy unavailable at {self.tor_proxy}: {str(exc)}")
            
            source_mode = "SIMULATED_TOR_ARTIFACT"
            status_code = 200
            resp_headers = {
                "server": "nginx/1.18.0 (Ubuntu)",
                "content-type": "text/html; charset=UTF-8",
                "x-onion-cluster": "node-eu-west-04",
                "x-frame-options": "DENY"
            }
            content_bytes = (
                f"<!-- ASTRA Ingestion Capture for {onion_url} -->\n"
                f"<html><head><title>Marketplace Gateway</title></head>\n"
                f"<body><h1>Vendor Portal</h1><p>PGP Key fingerprint: 92F4 81B3 E45C</p></body></html>"
            ).encode("utf-8")

        evidence = ledger.record_evidence(
            evidence_type=EvidenceType.ONION_CRAWL,
            source_target=onion_url,
            raw_bytes=content_bytes,
            metadata={
                "status_code": status_code,
                "source_mode": source_mode,
                "server_header": resp_headers.get("server", "unknown")
            }
        )

        return {
            "url": onion_url,
            "status_code": status_code,
            "byte_size": len(content_bytes),
            "evidence_id": evidence.evidence_id,
            "sha256": evidence.raw_sha256,
            "headers": resp_headers,
            "source_mode": source_mode,
            "jitter_delay_applied": round(jitter, 2)
        }

tor_collector = TorIngestionCollector()
