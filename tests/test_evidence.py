import json
from pathlib import Path

from astra.core.evidence import EvidenceLedger, GENESIS_HASH
from astra.core.models import EvidenceType

def test_evidence_ledger_hash_chain(tmp_path: Path):
    ledger_path = tmp_path / "test_ledger.jsonl"
    ledger = EvidenceLedger(ledger_file=ledger_path)

    audit = ledger.verify_chain_integrity()
    assert audit["valid"] is True
    assert audit["total_records"] == 0

    data1 = b"Tor circuit probe capture payload 1"
    rec1 = ledger.record_evidence(EvidenceType.ONION_CRAWL, "test1.onion", data1)
    assert rec1.parent_hash == GENESIS_HASH
    assert rec1.byte_size == len(data1)

    data2 = b"TLS Certificate payload 2"
    rec2 = ledger.record_evidence(EvidenceType.TLS_CERTIFICATE, "test1.onion", data2)
    assert rec2.parent_hash == rec1.block_hash

    audit2 = ledger.verify_chain_integrity()
    assert audit2["valid"] is True
    assert audit2["total_records"] == 2
    assert audit2["latest_block_hash"] == rec2.block_hash

def test_evidence_ledger_tamper_detection(tmp_path: Path):
    ledger_path = tmp_path / "tampered_ledger.jsonl"
    ledger = EvidenceLedger(ledger_file=ledger_path)

    rec1 = ledger.record_evidence(EvidenceType.ONION_CRAWL, "target.onion", b"original 1")
    rec2 = ledger.record_evidence(EvidenceType.BLOCKCHAIN_TX, "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", b"original 2")

    assert ledger.verify_chain_integrity()["valid"] is True

    lines = ledger_path.read_text(encoding="utf-8").splitlines()
    corrupt_block = json.loads(lines[0])
    corrupt_block["raw_sha256"] = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    lines[0] = json.dumps(corrupt_block)
    ledger_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    audit = ledger.verify_chain_integrity()
    assert audit["valid"] is False
    assert "tampered" in audit["error"].lower() or "mismatch" in audit["error"].lower() or "modified" in audit["error"].lower()

def test_section_65b_certificate(tmp_path: Path):
    ledger_path = tmp_path / "cert_ledger.jsonl"
    ledger = EvidenceLedger(ledger_file=ledger_path)
    ledger.record_evidence(EvidenceType.FORUM_DUMP, "Alphabay_Post_1", b"suspect text")

    cert = ledger.generate_section_65b_certificate(case_reference="CASE-TEST-001")
    assert cert["verification_status"] == "AUTHENTIC_AND_VERIFIED"
    assert cert["case_reference"] == "CASE-TEST-001"
    assert cert["chain_records_count"] == 1
    assert "cumulative_evidence_hash" in cert
