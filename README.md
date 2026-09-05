# 🛡️ PROJECT ASTRA: Darknet Threat Actor De-Anonymization Engine

**Smart India Hackathon (SIH) 2026**  
- **Problem Statement ID**: 26151  
- **Problem Statement Title**: Dark web threat actor de-anonymization  
- **Theme**: Blockchain & Cyber Security  
- **Category**: Software / Forensic Tool  
- **Team**: Team BISHOP  

---

## 📌 Executive Summary

**ASTRA** (*Adaptive Stylometric Threat Reconstruction Architecture*) is an autonomous, non-invasive threat intelligence and digital forensic software tool. Built for Law Enforcement Agencies (LEAs—such as NTRO, CBI, NIA, and State Cyber Crime units), ASTRA continuously ingests, correlates, and attributes fragmented darknet persona footprints to real-world threat actors.

ASTRA operates strictly as a **forensic software & CLI toolsuite / intelligence daemon**, fusing multi-modal technical, financial, behavioral, and cognitive evidence layers without active intrusion or illegal transactions.

---

## 🏛️ The 4-Pillar De-Anonymization Engine

ASTRA achieves high-accuracy attribution through four specialized analytical pillars:

1. **P1: INFRA-SCAN (Tor Misconfiguration Recon)**  
   Detects cryptographic, network, and server misconfigurations across hidden services (JARM fingerprinting, SSL/TLS certificate leaks, clearnet IP address correlation, and backend port exposure).
2. **P2: MGRD (Marketplace Ghost Residue Detection)**  
   Tracks vendor migration footprints, PGP public key reuse, and temporal migration reaction windows following darknet marketplace seizures and takedowns.
3. **P3: CMTBP (Crypto Micro-Transaction Breathing Pattern)**  
   Analyzes on-chain Bitcoin/Monero UTXO flows, fee heuristics, and pre-mixer micro-transaction testing rituals to pierce coin-mixing obfuscation.
4. **P4: CAA (Cognitive Argument Architecture)**  
   Extracts deep NLP stylometric feature vectors (structural syntax patterns, cognitive certainty/hedging markers, punctuation signatures, and argument trees) to identify personas across pseudonyms.

---

## ⚖️ Evidentiary Admissibility (BSA 2023 / Section 65B)

All forensic artifacts, raw telemetries, and attribution outputs are anchored in a cryptographically verifiable **SHA-256 hash chain**, guaranteeing full chain-of-custody compliance under Section 65B of the Indian Evidence Act and Bharatiya Sakshya Adhiniyam (BSA) 2023.

---

## 💻 CLI Tool Usage (`astra`)

### 1. Show Version & Compliance
```powershell
python -m astra version
```

### 2. P1: INFRA-SCAN (Tor Hidden Service Recon)
```powershell
python -m astra scan shadowmarket.onion --simulate-leak
```

### 3. P3: CMTBP (Cryptocurrency Mixer & UTXO Analysis)
```powershell
python -m astra trace bc1q9v8t3z4x7p2m6k8h1n0s5d3f7j9a2c4e6g8w
```

### 4. P4: CAA (Cognitive Stylometry Comparison)
```powershell
python -m astra stylometry sample_a.txt sample_b.txt
```

### 5. DACS Multi-Signal Fusion & Court Brief Generation
```powershell
python -m astra correlate --case "ASTRA-CASE-26151" --persona "VektorVendor_X" --demo
```
This automatically produces:
- Forensic Court Brief: `reports/ASTRA-CASE-26151_brief.md`
- JSON Evidence Dossier: `reports/ASTRA-CASE-26151_dossier.json`
- Inter-Agency STIX 2.1 Bundle: `reports/ASTRA-CASE-26151_stix21.json`

### 6. Audit Section 65B Hash Chain Integrity
```powershell
python -m astra verify-chain
```

---

## 🧪 Running Automated Tests

```powershell
python -m pytest -v
```
All 16 unit and integration test suites cover:
- Cryptographic hash chain immutability & tamper detection
- Section 65B certificate generation
- All 4 analytical pillars (INFRA-SCAN, MGRD, CMTBP, CAA)
- DACS multi-signal fusion algorithm
- STIX 2.1 and forensic dossier export
- CLI command invocation

---

## 🐳 Docker Deployment

ASTRA is 100% containerized and runs on any standard 8-core workstation or private server:

```powershell
docker compose up --build
```
This deploys:
1. `tor-proxy`: Isolated Tor SOCKS5 stealth proxy daemon.
2. `astra-engine`: Containerized ASTRA intelligence engine and CLI.
