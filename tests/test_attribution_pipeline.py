import pytest
from astra.services.attribution_pipeline import attribution_pipeline
from astra.pillars.cmtbp import cluster_wallets_by_common_input, wallets_share_owner
from astra.pillars.caa import caa_profiler

def test_wallet_clustering_union_find():
    txs = [
        {"inputs": ["w1", "w2"], "tx_id": "tx1"},
        {"inputs": ["w2", "w3"], "tx_id": "tx2"},
        {"inputs": ["w4"], "tx_id": "tx3"},
    ]
    clusters = cluster_wallets_by_common_input(txs)
    assert len(clusters) == 2
    c1 = next(c for c in clusters if "w1" in c)
    assert c1 == {"w1", "w2", "w3"}
    assert wallets_share_owner("w1", "w3", txs)
    assert not wallets_share_owner("w1", "w4", txs)

def test_stylometry_burrows_delta():
    t1 = "Guaranteed delivery strictly via stealth drops!! Do not ask for escrow bypass without PGP. Opsec is undeniable."
    t2 = "Always verify our signed pgp proof before releasing funds!! Strictly escrow protected. Opsec is undeniable."
    t_diff = "Totally unrelated post about casual weather and cooking pasta with fresh tomatoes and olive oil."

    sim_high = caa_profiler.compare_samples(t1, t2).author_similarity_score
    sim_low = caa_profiler.compare_samples(t1, t_diff).author_similarity_score

    assert sim_high > sim_low
    assert sim_high >= 0.55

def test_attribution_pipeline_run():
    actors = attribution_pipeline.run_attribution()
    assert len(actors) >= 1
    primary = next((a for a in actors if a.primary_alias == "vektor_ops"), None)
    assert primary is not None
    assert primary.dacs_score >= 80.0
    assert len(primary.aliases) >= 2
    assert primary.chain_hash != ""
