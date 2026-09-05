from astra.pillars.infra_scan import InfraScanPillar
from astra.pillars.mgrd import MgrdPillar
from astra.pillars.cmtbp import CmtbpPillar
from astra.pillars.caa import CaaPillar

def test_p1_infra_scan():
    scanner = InfraScanPillar()
    jarm = scanner.compute_jarm_fingerprint("darknet-portal.onion", 443)
    assert len(jarm) == 62

    mock_data = {
        "san_list": ["darknet-portal.onion", "clearnet.shadow-ops.org", "198.51.100.42"],
        "leaked_ips": ["198.51.100.42"],
        "open_ports": [80, 443, 22]
    }
    res = scanner.scan_target("darknet-portal.onion", mock_data=mock_data)
    assert res.confidence_score >= 0.7
    assert len(res.leaked_clearnet_ips) > 0
    assert any("clearnet" in ind.lower() for ind in res.indicators)

def test_p2_mgrd():
    mgrd = MgrdPillar()
    res = mgrd.analyze_migration_residue(
        persona_alias="PhantomVendor",
        known_forums=["MarketA", "MarketB", "MarketC"],
        pgp_keys=["4F92 B10E 88A2 C901 D443"],
        seizure_date_delta_hours=18.0,
        tox_or_jabber="phantom@jabber.ru"
    )
    assert res.confidence_score >= 0.8
    assert res.mirror_cluster_confidence > 0.8
    assert len(res.evidence_trail) >= 3

def test_p3_cmtbp():
    tracer = CmtbpPillar()
    txs = [
        {"txid": "1", "amount": 0.0005, "timestamp": 1700000000, "is_coinjoin": False},
        {"txid": "2", "amount": 2.5000, "timestamp": 1700001000, "is_coinjoin": True},
        {"txid": "3", "amount": 0.0008, "timestamp": 1700040000, "is_coinjoin": False},
        {"txid": "4", "amount": 1.2000, "timestamp": 1700041000, "is_coinjoin": True},
    ]
    res = tracer.analyze_wallet_transactions("bc1q_test_wallet", transactions=txs)
    assert res.pre_mixer_micro_txs_detected == 2
    assert res.mixer_heuristic_signature is not None
    assert res.confidence_score >= 0.7

def test_p4_caa():
    caa = CaaPillar()
    text_suspect = (
        "Strictly escrow protected!! Never bypass pgp signed verification. "
        "Opsec is guaranteed 100%."
    )
    text_known = (
        "Never bypass pgp signed verification!! Escrow strictly required. "
        "Guaranteed 100% opsec compliance."
    )
    res = caa.compare_samples(text_suspect, text_known)
    assert res.author_similarity_score > 0.65
    assert len(res.cognitive_marker_matches) > 0
