import re
import math
from typing import List, Dict, Any, Set, Tuple

from astra.core.evidence import ledger
from astra.core.models import CaaResult, EvidenceType

COGNITIVE_CERTAINTY_MARKERS: Set[str] = {
    "definitely", "always", "obviously", "guaranteed", "impossible",
    "undeniable", "100%", "never", "strictly", "absolutely", "certainly"
}
COGNITIVE_HEDGING_MARKERS: Set[str] = {
    "maybe", "perhaps", "supposedly", "possibly", "likely", "allegedly",
    "apparently", "seems", "somewhat", "roughly"
}
DARKNET_TECH_JARGON: Set[str] = {
    "opsec", "pgp", "socks5", "escrow", "fe", "multisig", "seed", "drop",
    "stealth", "monero", "utxo", "whirlpool", "coinjoin", "wasabi", "tor",
    "onion", "jabber", "tox", "xmr", "btc", "finalize", "fe"
}

_REFERENCE_CORPUS = [
    "Payment received, thank you for your order.",
    "Please allow a few extra days for shipping this week.",
    "Feedback is appreciated once the package arrives safely.",
    "All items are tested before they are sent out.",
    "Contact me if there are any issues with your order.",
    "Stock is limited so please order soon if interested.",
    "Escrow is recommended for all first time buyers here.",
    "Shipping is discreet and tracking is not provided.",
    "New batch available now, quality checked as always.",
    "Refunds are handled case by case, message me directly.",
    "PGP signed messages only, verify before sending funds.",
    "Delivery guaranteed or full reship, strictly stealth drops.",
]


def _extract_stylometric_features(text: str) -> Dict[str, float]:
    clean = text.strip()
    if not clean:
        return {}

    words = re.findall(r"\b[\w'-]+\b", clean.lower())
    sentences = [s.strip() for s in re.split(r"[.!?]+", clean) if s.strip()]
    word_count = len(words)

    if word_count == 0:
        return {}

    unique_words = len(set(words))
    ttr = unique_words / word_count
    avg_sent_len = word_count / max(len(sentences), 1)

    punct_per_k = 1000.0 / word_count
    features: Dict[str, float] = {
        "ttr": round(ttr, 4),
        "avg_sent_len": round(avg_sent_len, 2),
        "excl_rate": round(len(re.findall(r"!{2,}", clean)) * punct_per_k, 3),
        "ellipsis_rate": round(len(re.findall(r"\.{3,}", clean)) * punct_per_k, 3),
        "colon_rate": round(clean.count(":") * punct_per_k, 3),
        "cap_word_rate": round(len(re.findall(r"\b[A-Z]{2,}\b", clean)) * punct_per_k, 3),
    }

    all_markers = COGNITIVE_CERTAINTY_MARKERS | COGNITIVE_HEDGING_MARKERS | DARKNET_TECH_JARGON
    for marker in all_markers:
        count = words.count(marker)
        if count > 0:
            features[f"marker_{marker}"] = round(count * punct_per_k, 3)

    return features


def _build_corpus_stats() -> Dict[str, Tuple[float, float]]:
    vectors = [_extract_stylometric_features(t) for t in _REFERENCE_CORPUS]
    all_keys: Set[str] = set()
    for v in vectors:
        all_keys.update(v.keys())

    stats: Dict[str, Tuple[float, float]] = {}
    n = len(vectors)
    for key in all_keys:
        values = [v.get(key, 0.0) for v in vectors]
        mean = sum(values) / n
        variance = sum((x - mean) ** 2 for x in values) / n
        std = math.sqrt(variance)
        stats[key] = (mean, std)
    return stats


_CORPUS_STATS: Dict[str, Tuple[float, float]] = _build_corpus_stats()


def _zscore_vector(features: Dict[str, float]) -> Dict[str, float]:
    z: Dict[str, float] = {}
    for key, (mean, std) in _CORPUS_STATS.items():
        value = features.get(key, 0.0)
        z[key] = 0.0 if std < 1e-9 else (value - mean) / std
    return z


def _burrows_delta_distance(z_a: Dict[str, float], z_b: Dict[str, float]) -> float:
    keys = set(z_a.keys()) | set(z_b.keys())
    if not keys:
        return 0.0
    return sum(abs(z_a.get(k, 0.0) - z_b.get(k, 0.0)) for k in keys) / len(keys)


class CaaPillar:
    def __init__(self):
        self.name = "P4: CAA"

    def extract_features(self, text: str) -> Dict[str, Any]:
        raw = _extract_stylometric_features(text)
        words = re.findall(r"\b[\w'-]+\b", text.lower())
        found_markers: List[str] = []
        for w in set(words):
            if w in COGNITIVE_CERTAINTY_MARKERS:
                found_markers.append(f"CERTAINTY:{w}")
            elif w in COGNITIVE_HEDGING_MARKERS:
                found_markers.append(f"HEDGE:{w}")
            elif w in DARKNET_TECH_JARGON:
                found_markers.append(f"OPSEC_JARGON:{w}")
        return {
            "ttr": raw.get("ttr", 0.0),
            "avg_sent_len": raw.get("avg_sent_len", 0.0),
            "punctuation": {
                "excl_rate": raw.get("excl_rate", 0.0),
                "ellipsis_rate": raw.get("ellipsis_rate", 0.0),
                "colon_rate": raw.get("colon_rate", 0.0),
                "cap_word_rate": raw.get("cap_word_rate", 0.0),
            },
            "cognitive_markers": sorted(found_markers),
            "word_count": len(words),
        }

    def burrows_similarity(self, text_a: str, text_b: str) -> float:
        z_a = _zscore_vector(_extract_stylometric_features(text_a))
        z_b = _zscore_vector(_extract_stylometric_features(text_b))
        delta = _burrows_delta_distance(z_a, z_b)
        return 1.0 / (1.0 + delta)

    def compare_samples(
        self,
        sample_a: str,
        sample_b: str,
        sample_id: str = "CAA-EVAL-01"
    ) -> CaaResult:
        feat_a = self.extract_features(sample_a)
        feat_b = self.extract_features(sample_b)

        burrows_sim = self.burrows_similarity(sample_a, sample_b)

        set_a = set(feat_a["cognitive_markers"])
        set_b = set(feat_b["cognitive_markers"])
        inter = set_a & set_b
        union = set_a | set_b
        jaccard = (len(inter) / len(union)) if union else 0.5

        author_similarity = min(1.0, max(0.0, 0.75 * burrows_sim + 0.25 * jaccard))

        result = CaaResult(
            sample_id=sample_id,
            lexical_diversity_ttr=feat_a["ttr"],
            avg_sentence_length=feat_a["avg_sent_len"],
            punctuation_signature=feat_a["punctuation"],
            cognitive_marker_matches=sorted(list(inter)),
            author_similarity_score=round(author_similarity, 4),
            confidence_score=round(author_similarity, 4)
        )

        ledger.record_evidence(
            evidence_type=EvidenceType.TEXT_SAMPLE,
            source_target=sample_id,
            raw_bytes=result.model_dump_json().encode("utf-8"),
            metadata={"pillar": "P4_CAA", "score": author_similarity}
        )

        return result

    def match_candidates(
        self,
        query_text: str,
        candidates: Dict[str, str],
        threshold: float = 0.80
    ) -> List[Tuple[str, float]]:
        scored = [
            (alias, self.burrows_similarity(query_text, sample))
            for alias, sample in candidates.items()
        ]
        return sorted(
            (m for m in scored if m[1] >= threshold),
            key=lambda m: m[1],
            reverse=True
        )


caa_profiler = CaaPillar()
