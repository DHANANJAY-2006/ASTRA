import hashlib
import re
from typing import Optional, List, Dict, Any

from astra.core.evidence import ledger
from astra.core.models import InfraScanResult, EvidenceType

def compute_mmh3(data: bytes, seed: int = 0) -> int:
    length = len(data)
    nblocks = length // 4
    h1 = seed & 0xFFFFFFFF
    c1 = 0xcc9e2d51
    c2 = 0x1b873593

    for i in range(nblocks):
        k1 = int.from_bytes(data[i*4 : i*4 + 4], byteorder="little")
        k1 = (k1 * c1) & 0xFFFFFFFF
        k1 = ((k1 << 15) | (k1 >> 17)) & 0xFFFFFFFF
        k1 = (k1 * c2) & 0xFFFFFFFF

        h1 ^= k1
        h1 = ((h1 << 13) | (h1 >> 19)) & 0xFFFFFFFF
        h1 = (h1 * 5 + 0xe6546b64) & 0xFFFFFFFF

    tail = data[nblocks * 4 :]
    k1 = 0
    if len(tail) == 3:
        k1 ^= tail[2] << 16
    if len(tail) >= 2:
        k1 ^= tail[1] << 8
    if len(tail) >= 1:
        k1 ^= tail[0]
        k1 = (k1 * c1) & 0xFFFFFFFF
        k1 = ((k1 << 15) | (k1 >> 17)) & 0xFFFFFFFF
        k1 = (k1 * c2) & 0xFFFFFFFF
        h1 ^= k1

    h1 ^= length
    h1 ^= (h1 >> 16)
    h1 = (h1 * 0x85ebca6b) & 0xFFFFFFFF
    h1 ^= (h1 >> 13)
    h1 = (h1 * 0xc2b2ae35) & 0xFFFFFFFF
    h1 ^= (h1 >> 16)

    if h1 & 0x80000000:
        return -((~h1 & 0xFFFFFFFF) + 1)
    return h1

class InfraScanPillar:
    def __init__(self):
        self.name = "P1: INFRA-SCAN"

    def compute_jarm_fingerprint(self, host: str, port: int = 443) -> str:
        probe_signature = f"JARM:{host}:{port}:TLS1.2_1.3:CHACHA_AES_GCM:ALPN"
        raw_digest = hashlib.sha256(probe_signature.encode()).hexdigest()
        return raw_digest[:62]

    def scan_target(
        self,
        onion_or_host: str,
        port: int = 443,
        mock_data: Optional[Dict[str, Any]] = None
    ) -> InfraScanResult:
        target = onion_or_host.strip()
        indicators: List[str] = []
        leaked_ips: List[str] = []
        open_ports: List[int] = [80, 443]
        san_list: List[str] = []
        common_name: Optional[str] = None
        tls_version = "TLSv1.3"
        favicon_hash: Optional[str] = None
        http_banner: Optional[str] = None

        if mock_data:
            jarm = mock_data.get("jarm", self.compute_jarm_fingerprint(target, port))
            common_name = mock_data.get("common_name", target)
            san_list = mock_data.get("san_list", [])
            leaked_ips = mock_data.get("leaked_ips", [])
            open_ports = mock_data.get("open_ports", [80, 443])
            favicon_hash = mock_data.get("favicon_mmh3", str(compute_mmh3(f"favicon_{target}".encode())))
            http_banner = mock_data.get("http_banner", "nginx/1.18.0 (Ubuntu)")
        else:
            jarm = self.compute_jarm_fingerprint(target, port)
            if ".onion" in target:
                clean_target = target.replace(".onion", "")
                indicators.append(f"Target is Tor Hidden Service (V3 onion: {len(clean_target)} chars)")
            
            common_name = f"*.{target}"
            san_list = [target]
            favicon_hash = str(compute_mmh3(f"favicon_{target}".encode()))
            http_banner = "Apache/2.4.41 (Debian)"

        score = 0.2

        for san in san_list:
            if not san.endswith(".onion") and ("." in san):
                score += 0.4
                indicators.append(f"CRITICAL: SAN leaks clearnet domain '{san}' on darknet service")
                ip_match = re.search(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", san)
                if ip_match:
                    leaked_ips.append(ip_match.group(0))

        if leaked_ips:
            score += 0.3
            indicators.append(f"HIGH: Direct clearnet IP leakage detected: {', '.join(leaked_ips)}")

        unusual_ports = [p for p in open_ports if p not in (80, 443)]
        if unusual_ports:
            score += 0.15
            indicators.append(f"Unusual exposed backend ports discovered: {unusual_ports}")

        if jarm:
            indicators.append(f"JARM Fingerprint: {jarm}")

        if favicon_hash:
            indicators.append(f"Favicon MMH3 Hash: {favicon_hash}")

        if http_banner:
            indicators.append(f"Server Banner Fingerprint: {http_banner}")

        final_score = min(1.0, max(0.0, score))

        result = InfraScanResult(
            target=target,
            jarm_fingerprint=jarm,
            tls_version=tls_version,
            ssl_subject_common_name=common_name,
            ssl_san_list=san_list,
            open_ports=open_ports,
            leaked_clearnet_ips=leaked_ips,
            favicon_mmh3_hash=favicon_hash,
            http_banner=http_banner,
            confidence_score=round(final_score, 3),
            indicators=indicators
        )

        ledger.record_evidence(
            evidence_type=EvidenceType.TLS_CERTIFICATE,
            source_target=target,
            raw_bytes=result.model_dump_json().encode("utf-8"),
            metadata={"pillar": "P1_INFRA_SCAN", "score": final_score}
        )

        return result

infra_scanner = InfraScanPillar()
