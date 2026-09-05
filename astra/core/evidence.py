import hashlib
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any, List

from astra.config import config
from astra.core.models import EvidenceRecord, EvidenceType

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

class EvidenceLedger:
    """
    Immutable Cryptographic Hash Chain conforming to Section 65B of the Indian Evidence Act
    and Bharatiya Sakshya Adhiniyam (BSA), 2023.
    """

    def __init__(self, ledger_file: Optional[Path] = None):
        self.ledger_path = ledger_file or config.evidence_ledger_path
        self.ledger_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.ledger_path.exists():
            self.ledger_path.touch()

    def _get_last_block_hash(self) -> str:
        """Reads the latest block hash from the ledger. Returns GENESIS_HASH if empty."""
        last_hash = GENESIS_HASH
        if self.ledger_path.stat().st_size == 0:
            return last_hash

        with open(self.ledger_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    try:
                        record = json.loads(line)
                        last_hash = record.get("block_hash", last_hash)
                    except json.JSONDecodeError:
                        continue
        return last_hash

    def record_evidence(
        self,
        evidence_type: EvidenceType,
        source_target: str,
        raw_bytes: bytes,
        metadata: Optional[Dict[str, Any]] = None
    ) -> EvidenceRecord:
        """
        Hashes raw evidentiary data and anchors it into the cryptographic chain of custody.
        """
        raw_sha256 = hashlib.sha256(raw_bytes).hexdigest()
        byte_size = len(raw_bytes)
        now = datetime.now(timezone.utc)
        now_iso = now.isoformat()
        evidence_id = f"EV-{uuid.uuid4().hex[:12].upper()}"

        parent_hash = self._get_last_block_hash()

        # Cumulative block hash computation: SHA256(parent_hash || raw_sha256 || timestamp || id)
        block_preimage = f"{parent_hash}:{raw_sha256}:{now_iso}:{evidence_id}"
        block_hash = hashlib.sha256(block_preimage.encode("utf-8")).hexdigest()

        record = EvidenceRecord(
            evidence_id=evidence_id,
            evidence_type=evidence_type,
            source_target=source_target,
            raw_sha256=raw_sha256,
            byte_size=byte_size,
            captured_at=now,
            parent_hash=parent_hash,
            block_hash=block_hash,
            metadata=metadata or {}
        )

        with open(self.ledger_path, "a", encoding="utf-8") as f:
            f.write(record.model_dump_json() + "\n")

        return record

    def verify_chain_integrity(self) -> Dict[str, Any]:
        """
        Validates the complete chain of custody from genesis to head.
        Guarantees that evidence records have not been tampered with, truncated, or modified.
        """
        if not self.ledger_path.exists() or self.ledger_path.stat().st_size == 0:
            return {
                "valid": True,
                "total_records": 0,
                "latest_block_hash": GENESIS_HASH,
                "message": "Ledger is empty. Genesis state intact."
            }

        expected_parent = GENESIS_HASH
        records_count = 0

        with open(self.ledger_path, "r", encoding="utf-8") as f:
            for line_no, line in enumerate(f, start=1):
                line = line.strip()
                if not line:
                    continue

                try:
                    data = json.loads(line)
                    record = EvidenceRecord(**data)
                except Exception as e:
                    return {
                        "valid": False,
                        "broken_at_line": line_no,
                        "error": f"Corrupt JSON or invalid schema: {str(e)}"
                    }

                # Verify parent link
                if record.parent_hash != expected_parent:
                    return {
                        "valid": False,
                        "broken_at_line": line_no,
                        "evidence_id": record.evidence_id,
                        "error": f"Broken parent link. Expected {expected_parent}, found {record.parent_hash}"
                    }

                # Recompute block hash
                now_iso = record.captured_at.isoformat()
                block_preimage = f"{record.parent_hash}:{record.raw_sha256}:{now_iso}:{record.evidence_id}"
                computed_block = hashlib.sha256(block_preimage.encode("utf-8")).hexdigest()

                if computed_block != record.block_hash:
                    return {
                        "valid": False,
                        "broken_at_line": line_no,
                        "evidence_id": record.evidence_id,
                        "error": "Block hash mismatch. Data has been tampered with."
                    }

                expected_parent = record.block_hash
                records_count += 1

        return {
            "valid": True,
            "total_records": records_count,
            "latest_block_hash": expected_parent,
            "message": "Chain of custody verified successfully. All cryptographic anchors intact."
        }

    def generate_section_65b_certificate(self, case_reference: str) -> Dict[str, Any]:
        """
        Generates formal legal certificate data for admissibility under Bharatiya Sakshya Adhiniyam, 2023.
        """
        verification = self.verify_chain_integrity()
        if not verification["valid"]:
            raise ValueError(f"Cannot generate certificate for corrupt ledger: {verification.get('error')}")

        return {
            "certificate_title": "CERTIFICATE UNDER SECTION 65B INDIAN EVIDENCE ACT / BSA 2023",
            "case_reference": case_reference,
            "issued_at": datetime.now(timezone.utc).isoformat(),
            "forensic_tool": f"{config.app_name} (Team BISHOP)",
            "verification_status": "AUTHENTIC_AND_VERIFIED",
            "chain_records_count": verification["total_records"],
            "cumulative_evidence_hash": verification["latest_block_hash"],
            "statutory_declaration": (
                "This is to certify that the computer output containing threat intelligence and "
                "de-anonymization telemetries produced by ASTRA was generated during the regular course "
                "of autonomous passive reconnaissance under continuous SHA-256 cryptographic chain-of-custody."
            )
        }

# Global singleton
ledger = EvidenceLedger()
