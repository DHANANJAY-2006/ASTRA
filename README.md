# 🛡️ PROJECT ASTRA: Darknet Threat Actor De-Anonymization Forensic Tool

<p align="center">
  <img src="https://img.shields.io/badge/SIH-2026-blue.svg?style=for-the-badge&logo=target" alt="SIH 2026" />
  <img src="https://img.shields.io/badge/Problem%20Statement-26151-red.svg?style=for-the-badge" alt="Problem Statement 26151" />
  <img src="https://img.shields.io/badge/Team-BISHOP-purple.svg?style=for-the-badge" alt="Team BISHOP" />
  <img src="https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12%20%7C%203.14-blue?style=for-the-badge&logo=python" alt="Python Version" />
  <img src="https://img.shields.io/badge/Legal%20Admissibility-Section%2065B%20%7C%20BSA%202023-emerald?style=for-the-badge" alt="BSA 2023" />
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge" alt="License" />
</p>

---

## 📌 Repository "About" Description

> **Project ASTRA** (Adaptive Stylometric Threat Reconstruction Architecture) is an autonomous dark web threat intelligence and de-anonymization forensic software suite built for Law Enforcement Agencies (NTRO, CBI, NIA, State Cyber Police cells). Fuses Tor JARM & Favicon MMH3 reconnaissance, marketplace ghost residue tracking, crypto UTXO common-input ownership & micro-TX breathing rituals (CMTBP), and Burrows' Delta cognitive stylometry (CAA) into a deterministic 0–100% confidence score under Section 65B Indian Evidence Act / BSA 2023 cryptographic chain-of-custody.

---

## ⚡ Quickstart: Run ASTRA on Your Computer

### Step 1: Install Dependencies (Run once)

```powershell
python -m pip install -r requirements.txt
python -m pip install -e .
```

### Step 2: Run the Tool Immediately

You can use ASTRA via **Interactive Forensic Canvas** or **Headless Terminal CLI**:

#### Option A: Launch Central Interactive Investigation Canvas (Standalone / Zero-Server)
```powershell
python -m astra.cli.main ui
# Or directly:
python -m astra --graph
```
*Instantly renders the multi-pillar de-anonymization network canvas and opens it directly in your web browser. Completely serverless, 100% offline-ready, with zero port or background daemon requirements.*

#### Option B: Terminal CLI Operations
```powershell
# 1. Run the Multi-Persona Darknet Attribution Pipeline
python -m astra.cli.main pipeline

# 2. Run the SIH 2026 Judge Demonstration Scenario
python -m astra.cli.main demo

# 3. List Tracked Darknet Personas across AlphaBay, Bohemia, and Abacus
python -m astra.cli.main personas

# 4. Generate & Open Standalone Interactive Graph Canvas
python -m astra.cli.main graph --open

# 5. Audit Cryptographic Evidence Chain (Section 65B / BSA 2023)
python -m astra.cli.main verify-chain
```

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
│ Favicon MMH3    ││ Reaction Window ││ UTXO Clustering ││ Burrows' Delta  ││ Threat Heads    │
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

1. **P1: INFRA-SCAN (Tor Misconfiguration Recon & Clearnet Matching)**  
   - 62-character JARM TLS cipher fingerprinting.
   - SSL/TLS certificate Subject Alternative Names (SAN) leak extraction.
   - MurmurHash3 (MMH3) 32-bit favicon fingerprinting.
   - Default page and server banner reconnaissance.
   - Descriptor clock-skew and IP exposure detection.

2. **P2: MGRD (Marketplace Ghost Residue Detection)**  
   - De-anonymizes vendors relocating across darknet forum seizures (AlphaBay, Bohemia, Evolution).
   - Normalized PGP public key fingerprint matching.
   - Temporal reaction window analysis (quantifying migration within 12–72 hours).

3. **P3: CMTBP (Crypto Micro-Transaction Breathing Pattern)**  
   - Pierces Wasabi and Whirlpool coin mixers by detecting pre-mixer testing rituals (< 0.003 BTC trial transactions).
   - Common-input-ownership heuristic (Union-Find UTXO wallet clustering).
   - Periodic UTXO breathing interval modeling (sweep cadence).
   - Change address asymmetry heuristics.

4. **P4: CAA (Cognitive Argument Architecture)**  
   - Burrows' Delta z-score computational stylometry.
   - Function-word frequency distributions (writeprint).
   - Syntactic argument patterns and idiosyncratic punctuation ratios.
   - Cognitive certainty vs. hedging markers across pseudonyms.

---

## 🔬 Scientific Research & Academic References

| Research Area | Paper / Standard Citation | Technical Integration in ASTRA |
| :--- | :--- | :--- |
| **Darknet Streaming Ingestion** | *DANTE: Streaming Darknet Traffic Mining & DBSCAN Pipeline* | 6-stage autonomous streaming ingestion, token vectorization, and cluster tracking |
| **Stylometry Benchmark** | *VeriDark: Large-Scale Dark Web Stylometry & NLP Benchmark* | Burrows' Delta z-score distance against generic darknet reference corpus |
| **Tor Deanonymization** | *Trawling for Tor Hidden Services & Fingerprinting* (Biryukov et al.) | JARM TLS probe vectors and SSL Subject Alternative Name (SAN) clearnet exposure |
| **Blockchain DAG Modeling** | *Bitcoin DAG Transaction Modeling & Clustering* (Caprolu et al.) | Common-input-ownership heuristic and multi-input UTXO aggregation |
| **Lightning Protocol Tracing** | *Cross-Layer Crypto Tracing in Lightning Protocol* (Romiti et al.) | Micro-transaction timing correlation and mixer deposit analysis |
| **Digital Evidence Standards** | *Section 65B Indian Evidence Act & Bharatiya Sakshya Adhiniyam (BSA) 2023* | SHA-256 forward-linked cryptographic ledger ensuring evidentiary admissibility |

---

## 📊 Technical Comparison: ASTRA vs Existing Solutions

| Technical Capability | ASTRA (Project ASTRA) | Flashpoint | Chainalysis | Recorded Future | Basic Open Source |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Tor Infra to Real IP Matching** | **Specialized** (JARM + SAN + Favicon MMH3) | ❌ | ❌ | Partial | Manual only |
| **Mixer-Resilient Behavioral Trace** | **Behavioral** (Pre-mix micro-TX rituals) | ❌ | Breaks on Mixers | ❌ | ❌ |
| **Post-Seizure Persona Migration** | **Automated** (MGRD reaction windows) | Manual Search | ❌ | Manual Alerts | ❌ |
| **Cognitive Argument Stylometry** | **Invariant** (Burrows' Delta + Thought Logic) | Keyword Only | ❌ | ❌ | Cosine only |
| **Multi-Signal Attribution Scoring** | **Fused (DACS 0-100% Score)** | Forum Risk | Crypto Risk | Domain Risk | ❌ |
| **Court-Admissible Hash Chain** | **Sec 65B / BSA 2023 SHA-256 Ledger** | PDF Report | Hash Export | PDF Report | ❌ |
| **Autonomous 24x7 Stream Ingestion** | **6-Stage Streaming Pipeline** | Ingestion Engine | Ledger Feed | Web Scrapers | Cron only |
| **Central Interactive Force Graph** | **Yes (D3/Canvas Force Network)** | Basic Graph | Transaction Tree | Entity Map | Static HTML |
| **Deployment Overhead** | **Zero (Local PC / Docker Compose)** | Proprietary Cloud | Proprietary Cloud | Enterprise SaaS | Complex setup |
| **Annual Licensing Cost** | **100% Free / FOSS (Team BISHOP)** | ₹25L – ₹50L/yr | ₹20L – ₹40L/yr | ₹35L – ₹60L/yr | Free |

---

## 💻 Full CLI Command Reference

| Command | Purpose |
| :--- | :--- |
| `astra ui` | Launch central interactive forensic investigation canvas directly in default browser |
| `astra pipeline` | Run end-to-end multi-persona attribution pipeline with UTXO clustering |
| `astra demo` | Execute controlled SIH 2026 judge presentation de-anonymization walkthrough |
| `astra personas` | Display inventory of tracked darknet marketplace vendor personas |
| `astra scan <onion_url>` | Probe target .onion for JARM, TLS SAN leaks, and Favicon MMH3 |
| `astra trace <wallet_addr>` | Trace blockchain transactions for pre-mixer micro-TX rituals and breathing intervals |
| `astra stylometry <f1> <f2>` | Compare two text samples with Burrows' Delta z-score computational stylometry |
| `astra classify "<text>"` | Categorize listing into LEA crime heads (Carding, PII leaks, Ransomware, etc.) |
| `astra correlate --demo` | Execute 4-pillar DACS fusion and export court dossier & STIX 2.1 |
| `astra graph --open` | Generate central force-directed network graph and open in browser |
| `astra verify-chain` | Audit Section 65B BSA 2023 cryptographic hash-chain integrity |

---

## ⚖️ Legal & Evidentiary Compliance
Project ASTRA complies with **Section 65B of the Indian Evidence Act** and **Bharatiya Sakshya Adhiniyam (BSA) 2023**. Every piece of scraped text, TLS handshake signature, and transaction record is:
1. Hashed with SHA-256 upon ingestion.
2. Forward-linked in an append-only cryptographic ledger (`data/evidence_ledger.jsonl`).
3. Verifiable at any time via `astra verify-chain`.
4. Certified with an electronic evidence certificate for submission in court.
