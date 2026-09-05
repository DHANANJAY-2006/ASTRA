from astra.core.taxonomy import ThreatActivityClassifier

def test_taxonomy_classification():
    classifier = ThreatActivityClassifier()
    cats = classifier.classify("Selling fresh credit card cvv dumps and stripe logs")
    assert "FINANCIAL_FRAUD_CARDING" in cats

    cats2 = classifier.classify("Leaked Aadhaar and PAN database with phone numbers")
    assert "DATABASE_LEAKS_PII" in cats2

    cats3 = classifier.classify("General conversation about weather")
    assert "GENERAL_DARKNET_COMMERCE" in cats3
