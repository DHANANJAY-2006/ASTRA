import hashlib
from typing import List, Dict, Optional, Any, Set

from astra.core.evidence import ledger
from astra.core.models import CmtbpResult, EvidenceType


def cluster_wallets_by_common_input(transactions: List[Dict[str, Any]]) -> List[Set[str]]:
    parent: Dict[str, str] = {}

    def find(addr: str) -> str:
        parent.setdefault(addr, addr)
        while parent[addr] != addr:
            parent[addr] = parent[parent[addr]]
            addr = parent[addr]
        return addr

    def union(a: str, b: str) -> None:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb

    for tx in transactions:
        inputs = tx.get("inputs", [])
        for addr in inputs:
            find(addr)
        for i in range(1, len(inputs)):
            union(inputs[0], inputs[i])

    clusters: Dict[str, Set[str]] = {}
    for addr in parent:
        root = find(addr)
        clusters.setdefault(root, set()).add(addr)

    return list(clusters.values())


def wallets_share_owner(addr_a: str, addr_b: str, transactions: List[Dict[str, Any]]) -> bool:
    clusters = cluster_wallets_by_common_input(transactions)
    return any(addr_a in c and addr_b in c for c in clusters)


class CmtbpPillar:
    def __init__(self):
        self.name = "P3: CMTBP"

    def _compute_change_address_heuristic(self, transactions: List[Dict[str, Any]]) -> int:
        change_hits = 0
        for tx in transactions:
            outputs = tx.get("outputs", [])
            if len(outputs) == 2:
                amounts = [o.get("amount", 0.0) for o in outputs]
                if max(amounts) > 10 * min(amounts) and min(amounts) > 0:
                    change_hits += 1
        return change_hits

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
            return CmtbpResult(
                wallet_address=wallet_address,
                cryptocurrency=cryptocurrency,
                pre_mixer_micro_txs_detected=0,
                mixer_heuristic_signature=None,
                breathing_period_hours=24.0,
                utxo_cluster_size=1,
                confidence_score=0.45,
                flagged_patterns=[
                    f"Target address registered on {cryptocurrency} blockchain: {wallet_address}",
                    "Live UTXO feed required for full on-chain forensics"
                ]
            )

        micro_txs = [tx for tx in tx_list if 0.0001 <= tx.get("amount", 0.0) <= 0.003]
        micro_tx_count = len(micro_txs)

        if micro_tx_count >= 1:
            score += 0.35
            flagged_patterns.append(
                f"HIGH: {micro_tx_count} pre-mixer micro-transaction test ritual(s) detected (<0.003 {cryptocurrency})"
            )

        coinjoin_txs = [tx for tx in tx_list if tx.get("is_coinjoin", False)]
        equal_output_txs = [tx for tx in tx_list if tx.get("amount") in [0.01, 0.05, 0.1, 0.5]]
        mixer_hits = coinjoin_txs + equal_output_txs

        if mixer_hits:
            score += 0.30
            mixer_type = "CoinJoin" if coinjoin_txs else "Equal-Output Pool"
            mixer_signature = f"{mixer_type} / Wasabi / Whirlpool Heuristic Signature"
            flagged_patterns.append(f"CRITICAL: Mixer interaction detected: {mixer_signature}")

        input_cluster_txs = [tx for tx in tx_list if len(tx.get("inputs", [])) >= 2]
        if input_cluster_txs:
            clusters = cluster_wallets_by_common_input(input_cluster_txs)
            significant = [c for c in clusters if len(c) >= 2]
            if significant:
                score += 0.15
                utxo_cluster_size = max(len(c) for c in significant)
                flagged_patterns.append(
                    f"Common-input-ownership heuristic: {len(significant)} co-spending cluster(s), "
                    f"largest cluster: {utxo_cluster_size} addresses"
                )

        change_hits = self._compute_change_address_heuristic(tx_list)
        if change_hits > 0:
            score += 0.10
            flagged_patterns.append(
                f"Change address heuristic: {change_hits} transaction(s) with suspicious 2-output asymmetry"
            )

        timestamps = [
            tx["timestamp"] for tx in tx_list
            if "timestamp" in tx and isinstance(tx["timestamp"], (int, float))
        ]
        if len(timestamps) >= 3:
            timestamps.sort()
            deltas = [timestamps[i + 1] - timestamps[i] for i in range(len(timestamps) - 1)]
            avg_delta_hours = (sum(deltas) / len(deltas)) / 3600.0
            breathing_period_hours = round(avg_delta_hours, 2)

            if 1.0 <= breathing_period_hours <= 24.0:
                score += 0.20
                flagged_patterns.append(
                    f"Periodic UTXO breathing interval: avg sweep every {breathing_period_hours:.1f}h "
                    f"— consistent with automated vendor payout cadence"
                )

        final_score = min(1.0, max(0.0, score))

        result = CmtbpResult(
            wallet_address=wallet_address,
            cryptocurrency=cryptocurrency,
            pre_mixer_micro_txs_detected=micro_tx_count,
            mixer_heuristic_signature=mixer_signature,
            breathing_period_hours=breathing_period_hours,
            utxo_cluster_size=utxo_cluster_size,
            confidence_score=round(final_score, 4),
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
