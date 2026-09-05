import hashlib
from typing import List, Dict, Optional, Any

from astra.core.evidence import ledger
from astra.core.models import CmtbpResult, EvidenceType

class CmtbpPillar:
    def __init__(self):
        self.name = "P3: CMTBP"

    def analyze_wallet_transactions(
        self,
        wallet_address: str,
        transactions: Optional[List[Dict[str, Any]]] = None,
        cryptocurrency: str = "BTC"
    ) -> CmtbpResult:
        flagged_patterns: List[str] = []
        score = 0.1
        micro_tx_count = 0
        mixer_signature: Optional[str] = None
        breathing_period_hours = 0.0
        utxo_cluster_size = 1

        tx_list = transactions or []

        if not tx_list:
            score = 0.45
            flagged_patterns.append(f"Target address monitored on {cryptocurrency} blockchain: {wallet_address}")
            flagged_patterns.append("Unspent Transaction Output (UTXO) history requires active explorer feed")
            return CmtbpResult(
                wallet_address=wallet_address,
                cryptocurrency=cryptocurrency,
                pre_mixer_micro_txs_detected=0,
                mixer_heuristic_signature=None,
                breathing_period_hours=24.0,
                utxo_cluster_size=1,
                confidence_score=score,
                flagged_patterns=flagged_patterns
            )

        micro_txs = [
            tx for tx in tx_list
            if 0.0001 <= tx.get("amount", 0.0) <= 0.003
        ]
        micro_tx_count = len(micro_txs)

        if micro_tx_count >= 1:
            score += 0.35
            flagged_patterns.append(
                f"HIGH: Identified {micro_tx_count} pre-mixer micro-transaction test ritual(s) (< 0.003 {cryptocurrency})"
            )

        equal_output_txs = [
            tx for tx in tx_list
            if tx.get("is_coinjoin", False) or tx.get("amount") in [0.01, 0.05, 0.1, 0.5]
        ]
        if equal_output_txs:
            score += 0.30
            mixer_signature = "CoinJoin / Wasabi / Whirlpool Equal-Output Pool Heuristic"
            flagged_patterns.append(f"CRITICAL: Mixer interaction signature detected: {mixer_signature}")

        timestamps = [
            tx["timestamp"] for tx in tx_list
            if "timestamp" in tx and isinstance(tx["timestamp"], (int, float))
        ]
        if len(timestamps) >= 3:
            timestamps.sort()
            deltas = [timestamps[i+1] - timestamps[i] for i in range(len(timestamps)-1)]
            avg_delta_hours = (sum(deltas) / len(deltas)) / 3600.0
            breathing_period_hours = round(avg_delta_hours, 2)
            utxo_cluster_size = len(tx_list)
            
            if 1.0 <= breathing_period_hours <= 24.0:
                score += 0.20
                flagged_patterns.append(
                    f"Periodic UTXO breathing interval observed: avg sweep every {breathing_period_hours:.1f} hours"
                )

        final_score = min(1.0, max(0.0, score))

        result = CmtbpResult(
            wallet_address=wallet_address,
            cryptocurrency=cryptocurrency,
            pre_mixer_micro_txs_detected=micro_tx_count,
            mixer_heuristic_signature=mixer_signature,
            breathing_period_hours=breathing_period_hours,
            utxo_cluster_size=utxo_cluster_size,
            confidence_score=round(final_score, 3),
            flagged_patterns=flagged_patterns
        )

        ledger.record_evidence(
            evidence_type=EvidenceType.BLOCKCHAIN_TX,
            source_target=wallet_address,
            raw_bytes=result.model_dump_json().encode("utf-8"),
            metadata={"pillar": "P3_CMTBP", "score": final_score}
        )

        return result

cmtbp_tracer = CmtbpPillar()
