import re
import math
from typing import List, Dict, Optional, Any, Set

from astra.core.evidence import ledger
from astra.core.models import CaaResult, EvidenceType

# Linguistic and cognitive indicator dictionaries
COGNITIVE_CERTAINTY_MARKERS: Set[str] = {
    "definitely", "always", "obviously", "guaranteed", "impossible", "undeniable", "100%", "never", "strictly"
}
COGNITIVE_HEDGING_MARKERS: Set[str] = {
    "maybe", "perhaps", "supposedly", "possibly", "likely", "allegedly", "apparently", "seems"
}
DARKNET_TECH_JARGON: Set[str] = {
    "opsec", "pgp", "socks5", "escrow", "fe", "multisig", "seed", "drop", "stealth", "monero", "utxo", "whirlpool"
}

class CaaPillar:
    """
    P4: CAA (Cognitive Argument Architecture).
    Advanced NLP stylometry and cognitive argument profiling.
    Extracts idiosyncratic syntax, punctuation signatures, lexical richness,
    and cognitive reasoning patterns to correlate anonymous forum postings across personas.
    """

    def __init__(self):
        self.name = "P4: CAA"

    def extract_features(self, text: str) -> Dict[str, Any]:
        """
        Extracts stylometric and cognitive feature vectors from text.
        """
        clean_text = text.strip()
        if not clean_text:
            return {
                "ttr": 0.0,
                "avg_sent_len": 0.0,
                "punctuation": {},
                "cognitive_markers": [],
                "word_count": 0
            }

        # Tokenization
        words = re.findall(r"\b[\w'-]+\b", clean_text.lower())
        sentences = [s.strip() for s in re.split(r"[.!?]+", clean_text) if s.strip()]
        
        word_count = len(words)
        unique_words = len(set(words))
        # Type-Token Ratio (Lexical Diversity)
        ttr = (unique_words / word_count) if word_count > 0 else 0.0

        # Sentence length
        avg_sent_len = (word_count / len(sentences)) if sentences else 0.0

        # Punctuation signature
        punct_counts = {
            "exclamations": len(re.findall(r"!{2,}", clean_text)),
            "ellipses": len(re.findall(r"\.{3,}", clean_text)),
            "colons": clean_text.count(":"),
            "semicolons": clean_text.count(";"),
            "quotes": clean_text.count('"') + clean_text.count("'"),
            "emoticons": len(re.findall(r"[:;=8]['-]?[\)D\(P\/\\]", clean_text))
        }
        # Normalize per 1000 words
        norm_factor = 1000.0 / max(word_count, 1)
        punct_signature = {k: round(v * norm_factor, 2) for k, v in punct_counts.items()}

        # Cognitive markers
        found_markers: List[str] = []
        for w in set(words):
            if w in COGNITIVE_CERTAINTY_MARKERS:
                found_markers.append(f"CERTAINTY:{w}")
            elif w in COGNITIVE_HEDGING_MARKERS:
                found_markers.append(f"HEDGE:{w}")
            elif w in DARKNET_TECH_JARGON:
                found_markers.append(f"OPSEC_JARGON:{w}")

        return {
            "ttr": round(ttr, 3),
            "avg_sent_len": round(avg_sent_len, 1),
            "punctuation": punct_signature,
            "cognitive_markers": sorted(found_markers),
            "word_count": word_count
        }

    def compare_samples(
        self,
        sample_a: str,
        sample_b: str,
        sample_id: str = "CAA-EVAL-01"
    ) -> CaaResult:
        """
        Compares two text samples (e.g. unknown vendor listing vs suspect forum post)
        and computes stylometric cosine/manhattan similarity.
        """
        feat_a = self.extract_features(sample_a)
        feat_b = self.extract_features(sample_b)

        # Compute metric similarities
        # 1. Lexical diversity difference
        ttr_diff = abs(feat_a["ttr"] - feat_b["ttr"])
        ttr_sim = max(0.0, 1.0 - (ttr_diff * 2.0))

        # 2. Sentence length difference
        sent_diff = abs(feat_a["avg_sent_len"] - feat_b["avg_sent_len"])
        sent_sim = max(0.0, 1.0 - (sent_diff / 25.0))

        # 3. Punctuation signature similarity
        p_a = feat_a["punctuation"]
        p_b = feat_b["punctuation"]
        all_keys = set(p_a.keys()).union(p_b.keys())
        dist = sum(abs(p_a.get(k, 0.0) - p_b.get(k, 0.0)) for k in all_keys)
        punct_sim = max(0.0, 1.0 - (dist / 30.0))

        # 4. Shared cognitive markers
        set_a = set(feat_a["cognitive_markers"])
        set_b = set(feat_b["cognitive_markers"])
        inter = set_a.intersection(set_b)
        union = set_a.union(set_b)
        jaccard = (len(inter) / len(union)) if union else 0.5

        # Weighted aggregate similarity
        author_similarity = (
            0.30 * ttr_sim +
            0.25 * sent_sim +
            0.25 * punct_sim +
            0.20 * jaccard
        )
        author_similarity = min(1.0, max(0.0, author_similarity))

        result = CaaResult(
            sample_id=sample_id,
            lexical_diversity_ttr=feat_a["ttr"],
            avg_sentence_length=feat_a["avg_sent_len"],
            punctuation_signature=feat_a["punctuation"],
            cognitive_marker_matches=sorted(list(inter)),
            author_similarity_score=round(author_similarity, 3),
            confidence_score=round(author_similarity, 3)
        )

        # Record evidence to Section 65B hash chain
        ledger.record_evidence(
            evidence_type=EvidenceType.TEXT_SAMPLE,
            source_target=sample_id,
            raw_bytes=result.model_dump_json().encode("utf-8"),
            metadata={"pillar": "P4_CAA", "score": author_similarity}
        )

        return result

# Singleton instance
caa_profiler = CaaPillar()
