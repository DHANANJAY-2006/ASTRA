# 🛡️ PROJECT ASTRA: Darknet Threat Actor De-Anonymization Engine

<p align="center">
  <img src="https://img.shields.io/badge/SIH-2026-blue.svg?style=for-the-badge&logo=target" alt="SIH 2026" />
  <img src="https://img.shields.io/badge/Problem%20Statement-26151-red.svg?style=for-the-badge" alt="Problem Statement 26151" />
  <img src="https://img.shields.io/badge/Team-BISHOP-purple.svg?style=for-the-badge" alt="Team BISHOP" />
  <img src="https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-blue?style=for-the-badge&logo=python" alt="Python Version" />
  <img src="https://img.shields.io/badge/Legal%20Admissibility-Section%2065B%20%7C%20BSA%202023-emerald?style=for-the-badge" alt="BSA 2023" />
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge" alt="License" />
</p>

---

## 📌 Repository "About" Description

> **Project ASTRA** is an autonomous darknet threat intelligence and forensic de-anonymization engine built for Law Enforcement Agencies (NTRO, CBI, NIA, State Police). Fuses Tor JARM reconnaissance, marketplace ghost residue tracking, crypto mixer-piercing breathing heuristics (CMTBP), and cognitive argument stylometry (CAA) into a deterministic 0–100% confidence score under Section 65B Indian Evidence Act / BSA 2023 cryptographic chain-of-custody.

---

## ⚡ Quickstart: Run ASTRA on Your Computer

### Step 1: Install Dependencies (Run once)

```powershell
# In PowerShell or Command Prompt inside the ASTRA folder:
python -m pip install -r requirements.txt
python -m pip install -e .
```

### Step 2: Run the Tool Immediately

You do **not** need Docker. ASTRA runs directly on your computer with standard Python:

```powershell
# 1. Open the Central Interactive Visual Graph in your default web browser
python -m astra graph --open

# 2. Run the Full 4-Pillar De-Anonymization Engine & Export Court Dossiers
python -m astra correlate --demo

# 3. Or on Windows, simply double-click or run:
.\launch.bat
```

> **Note on Docker (Optional)**: If you are deploying on a headless Linux server or wish to run through a containerized Tor SOCKS5 proxy, you can optionally run `docker compose up --build` (requires Docker Desktop / Docker daemon to be running). For local PCs, standard Python is recommended.

---

## 🏛️ The 4-Pillar De-Anonymization Architecture

```
                                  ┌────────────────────────┐
                                  │   Target Threat Actor  │
                                  └───────────┬────────────┘
                                              │
         ┌──────────────────┬─────────────────┼─────────────────┬──────────────────┐
         │                  │                 │                 │                  │
         ▼                  ▼                 ▼                 ▼                  ▼
┌─────────────────┐┌─────────────────┐┌─────────────────┐┌─────────────────┐┌─────────────────┐
│ P1: INFRA-SCAN  ││    P2: MGRD     ││   P3: CMTBP     ││    P4: CAA      ││  LEA TAXONOMY   │
│ Tor JARM Recon  ││ Market Residue  ││ Crypto Breathing││  Cognitive NLP  ││ Activity Class │
│ Clearnet Leaks  ││  PGP Migration  ││ Mixer Piercing  ││ Stylometry Tree ││ PII/Carding/APT │
└────────┬────────┘└────────┬────────┘└────────┬────────┘└────────┬────────┘└────────┬────────┘
         │                  │                 │                 │                  │
         └──────────────────┴─────────┬───────┴─────────────────┴──────────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │    DACS Scoring Engine    │
                        │ Multi-Signal Fusion 0-100%│
                        └─────────────┬─────────────┘
                                      ▼
                 ┌─────────────────────────────────────────┐
                 │ Section 65B BSA 2023 Cryptographic Hash │
                 │       Court-Admissible Evidence         │
                 └────────────────────┬────────────────────┘
                                      ▼
                ┌───────────────────────────────────────────┐
                │ Central Interactive Investigation Canvas  │
                │     STIX 2.1 JSON / Court Legal Brief     │
                └───────────────────────────────────────────┘
```

1. **P1: INFRA-SCAN (Tor Misconfiguration Recon)**  
   Extracts 62-character JARM TLS cipher fingerprints, inspects SSL/TLS certificate Subject Alternative Names (SAN), flags exposed backend management ports, and discovers leaked clearnet IPv4 addresses.
2. **P2: MGRD (Marketplace Ghost Residue Detection)**  
   De-anonymizes vendors relocating across darknet forum seizures and takedowns by tracking normalized PGP public key fingerprints and temporal migration reaction windows (12–72 hours).
3. **P3: CMTBP (Crypto Micro-Transaction Breathing Pattern)**  
   Pierces Wasabi and Whirlpool coin mixers by detecting pre-mixer testing rituals (< 0.003 BTC trial transactions) and modeling UTXO cluster sweep intervals.
4. **P4: CAA (Cognitive Argument Architecture)**  
   NLP stylometric author attribution mapping Type-Token Ratio (TTR), idiosyncratic punctuation patterns, and cognitive certainty vs. hedging markers across pseudonyms.

---

## 📊 Central Interactive Investigation Canvas

ASTRA generates an interconnected forensic network graph in the center of the investigation, visually mapping every entity linked to the threat actor:

```powershell
python -m astra graph --open
```

- **Interactive Canvas**: Drag, zoom, pan, and inspect connections between onion services, PGP keys, Bitcoin wallets, and leaked IPs.
- **Forensic Inspector**: Click any node to open the side inspector panel displaying raw evidence, confidence scores, and SHA-256 hashes.
- **Filter Bar**: Toggle visibility across all 4 pillars and the legal chain.

---

## 💻 Forensic CLI Commands

| Command | Action | Example |
| :--- | :--- | :--- |
| `astra version` | Display engine version and compliance info | `python -m astra version` |
| `astra scan <target>` | P1: INFRA-SCAN Tor hidden service reconnaissance | `python -m astra scan market.onion --simulate-leak` |
| `astra trace <wallet>` | P3: CMTBP On-chain mixer & UTXO breathing analysis | `python -m astra trace bc1q9v8t3z4x7p2m...` |
| `astra stylometry <a.txt> <b.txt>` | P4: CAA Stylometric cognitive author comparison | `python -m astra stylometry sample1.txt sample2.txt` |
| `astra classify <text>` | Classify darknet listing into LEA crime categories | `python -m astra classify "selling leaked aadhaar db"` |
| `astra correlate` | Run full 4-pillar DACS fusion & export dossier | `python -m astra correlate --demo` |
| `astra graph` | Launch central interactive network canvas in browser | `python -m astra graph --open` |
| `astra verify-chain` | Audit Section 65B / BSA 2023 cryptographic hash chain | `python -m astra verify-chain` |

---

## ⚖️ Evidentiary Admissibility (BSA 2023 / Section 65B)

All evidence collected during passive reconnaissance is anchored into an immutable **SHA-256 hash chain ledger** (`data/evidence_ledger.jsonl`). Each block links cryptographically to the parent block hash:

$$\text{Block Hash} = \text{SHA-256}(\text{Parent Hash} \parallel \text{Raw SHA-256} \parallel \text{Timestamp} \parallel \text{Evidence ID})$$

ASTRA automatically exports court-admissible certificates under Section 65B of the Indian Evidence Act and Bharatiya Sakshya Adhiniyam, 2023.

---

## 🧪 Automated Testing

```powershell
python -m pytest -v
```

All 18 test suites validate:
- Cryptographic hash chain immutability & tamper resistance
- All 4 analytical pillars (INFRA-SCAN, MGRD, CMTBP, CAA)
- DACS multi-signal fusion math & threshold bounds
- Central interactive graph rendering
- LEA threat taxonomy classification
- STIX 2.1 and court dossier export formats

---

## 📁 Repository Structure

```
ASTRA/
├── astra/
│   ├── cli/             # Rich terminal CLI toolsuite
│   ├── core/            # Evidence ledger, data models, LEA taxonomy
│   ├── dacs/            # DACS multi-signal fusion engine (0-100%)
│   ├── exporters/       # STIX 2.1 JSON and court brief generators
│   ├── ingestion/       # Tor SOCKS5 passive ingestion collector
│   ├── pillars/         # P1 (INFRA), P2 (MGRD), P3 (CMTBP), P4 (CAA)
│   └── visualization/   # Interactive central graph canvas builder
├── data/                # Local evidence ledger & samples
├── reports/             # Exported briefs, STIX 2.1 bundles, and graphs
├── tests/               # 18 automated unit and integration tests
├── Dockerfile           # Multi-stage containerization
├── docker-compose.yml   # Multi-service deployment with Tor proxy
└── pyproject.toml       # Python packaging configuration
```
