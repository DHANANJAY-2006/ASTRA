import {
  DashboardStats,
  ActorSearchResult,
  ActorProfile,
  ActorEnrichment,
  AttributionBreakdown,
  TimelineEvent,
  HiddenServices,
  Alert,
  ActorThreatActivity
} from "./api";

export const MOCK_STATS: DashboardStats = {
  threat_actors: { label: "Attributed Threat Actors", value: 4, trend_pct: 100, sparkline: [1, 2, 2, 3, 4] },
  unique_handles: { label: "Tracked Darknet Handles", value: 18, trend_pct: 25, sparkline: [12, 14, 15, 17, 18] },
  pgp_keys: { label: "Normalized PGP Keys", value: 8, trend_pct: 12, sparkline: [5, 6, 7, 7, 8] },
  wallets_tracked: { label: "UTXO Wallets Monitored", value: 14, trend_pct: 40, sparkline: [8, 10, 11, 13, 14] },
  attribution_links: { label: "De-Anonymization Edges", value: 26, trend_pct: 65, sparkline: [10, 15, 18, 22, 26] },
  high_confidence_links: { label: "Section 65B Sealed Links", value: 6, trend_pct: 100, sparkline: [1, 2, 4, 5, 6] }
};

export const MOCK_ACTORS: ActorSearchResult[] = [
  {
    id: "ASTRA-ACTOR-001",
    label: "Vektor Syndicate (vektor_ops / krypton_vendor)",
    confidence_score: 1.0,
    updated_at: new Date().toISOString(),
    matched_identifier: "vektor_ops"
  },
  {
    id: "ASTRA-ACTOR-002",
    label: "Phantom Brokerage (phantom_broker)",
    confidence_score: 0.725,
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    matched_identifier: "phantom_broker"
  },
  {
    id: "ASTRA-ACTOR-003",
    label: "Cerberus Data Cell (cerberus_leaks)",
    confidence_score: 0.65,
    updated_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    matched_identifier: "cerberus_leaks"
  },
  {
    id: "ASTRA-ACTOR-004",
    label: "Hydra Cashout Cluster (hydra_cashout)",
    confidence_score: 0.81,
    updated_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    matched_identifier: "hydra_cashout"
  }
];

export const MOCK_PROFILES: Record<string, ActorProfile> = {
  "ASTRA-ACTOR-001": {
    id: "ASTRA-ACTOR-001",
    label: "Vektor Syndicate",
    confidence_score: 1.0,
    created_at: "2026-03-01T10:00:00Z",
    updated_at: new Date().toISOString(),
    identifiers: [
      {
        id: "id-1",
        identifier_type: "handle",
        value: "vektor_ops",
        source_platform: "AlphaBay_V2",
        first_seen: "2025-11-12T00:00:00Z",
        last_seen: "2026-02-14T18:30:00Z"
      },
      {
        id: "id-2",
        identifier_type: "handle",
        value: "krypton_vendor",
        source_platform: "BohemiaMarket",
        first_seen: "2026-02-15T19:00:00Z",
        last_seen: "2026-03-05T12:00:00Z"
      },
      {
        id: "id-3",
        identifier_type: "handle",
        value: "nexus_distro",
        source_platform: "AbacusDarknet",
        first_seen: "2026-02-20T04:15:00Z",
        last_seen: "2026-03-04T09:00:00Z"
      },
      {
        id: "id-4",
        identifier_type: "wallet",
        value: "bc1q9v8t3z4x7p2m6k8h1n0s5d3f7j9a2c4e6g8w",
        source_platform: "AlphaBay_V2",
        first_seen: "2025-11-15T00:00:00Z",
        last_seen: "2026-03-05T00:00:00Z"
      },
      {
        id: "id-5",
        identifier_type: "wallet",
        value: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
        source_platform: "BohemiaMarket",
        first_seen: "2026-02-16T00:00:00Z",
        last_seen: "2026-03-05T00:00:00Z"
      },
      {
        id: "id-6",
        identifier_type: "pgp_key",
        value: "92F4 81B3 E45C 70A1 0D32 FB01 4C8A 9E2F 1120 4A77",
        source_platform: "AlphaBay_V2",
        first_seen: "2025-11-12T00:00:00Z",
        last_seen: "2026-03-05T00:00:00Z"
      },
      {
        id: "id-7",
        identifier_type: "onion_address",
        value: "vektor774kxqm9p2zt7y4b5q0c9v8t3z4x7p2m6k8h1n0s5d3f7j9a2c.onion",
        source_platform: "Darknet Portal",
        first_seen: "2025-12-01T00:00:00Z",
        last_seen: "2026-03-05T00:00:00Z"
      }
    ],
    infra_findings: [
      {
        id: "inf-1",
        onion_address: "vektor774kxqm9p2zt7y4b5q0c9v8t3z4x7p2m6k8h1n0s5d3f7j9a2c.onion",
        finding_type: "ssl_san_clearnet_leak",
        detail: {
          san_entries: ["vektor774kxqm9p2zt7y4b5q0c9v8t3z4x7p2m6k8h1n0s5d3f7j9a2c.onion", "auth.vektor-ops.ru", "185.220.101.5"],
          jarm_fingerprint: "27d27d27d00027d1dc42d42d00042d87e0766e409cf9bbafb3e77f08cf2cb5",
          open_ports: [80, 443, 22, 9001],
          issuer: "Let's Encrypt Authority X3"
        },
        severity: "critical",
        scan_job_id: "scan-9901",
        resolved_ip: "185.220.101.5",
        discovered_at: "2026-03-02T14:20:00Z"
      },
      {
        id: "inf-2",
        onion_address: "vektor774kxqm9p2zt7y4b5q0c9v8t3z4x7p2m6k8h1n0s5d3f7j9a2c.onion",
        finding_type: "favicon_mmh3_match",
        detail: {
          mmh3_hash: -1294827104,
          clearnet_correlations: ["auth.vektor-ops.ru/favicon.ico"]
        },
        severity: "high",
        scan_job_id: "scan-9902",
        resolved_ip: "185.220.101.5",
        discovered_at: "2026-03-02T15:10:00Z"
      }
    ],
    style_profiles: [
      {
        id: "style-1",
        identifier_id: "id-1",
        feature_vector: {
          burrows_delta_distance: 0.142,
          syntactic_certainty_score: 0.946,
          lexical_ttr: 0.784,
          avg_sentence_length: 16.8
        },
        sample_count: 32
      }
    ],
    attribution_edges: [
      {
        id: "edge-1",
        username_a: "vektor_ops",
        platform_a: "AlphaBay_V2",
        username_b: "krypton_vendor",
        platform_b: "BohemiaMarket",
        edge_type: "SHARED_PGP_KEY",
        weight: 0.98
      },
      {
        id: "edge-2",
        username_a: "krypton_vendor",
        platform_a: "BohemiaMarket",
        username_b: "nexus_distro",
        platform_b: "AbacusDarknet",
        edge_type: "COMMON_INPUT_WALLET_CLUSTER",
        weight: 0.95
      },
      {
        id: "edge-3",
        username_a: "vektor_ops",
        platform_a: "AlphaBay_V2",
        username_b: "krypton_vendor",
        platform_b: "BohemiaMarket",
        edge_type: "CAA_BURROWS_DELTA_MATCH",
        weight: 0.946
      },
      {
        id: "edge-4",
        username_a: "vektor_ops",
        platform_a: "AlphaBay_V2",
        username_b: "nexus_distro",
        platform_b: "AbacusDarknet",
        edge_type: "INFRA_CLEARNET_SAN_LEAK",
        weight: 1.0
      }
    ],
    real_world_entities: [
      {
        id: "rw-1",
        entity_name: "185.220.101.5 (Novosibirsk, Russian Federation)",
        entity_type: "clearnet_ip_and_isp",
        relationship_type: "HOSTED_ON_CLEARNET_NODE",
        evidence: {
          isp: "Selectel PJSC",
          asn: "AS49505",
          ptr: "srv-05.vektor-ops.ru",
          reverse_dns: "auth.vektor-ops.ru"
        },
        source: "INFRA_SCAN_SAN_PROBE",
        source_record_id: "inf-1",
        observed_at: "2026-03-02T14:20:00Z",
        confidence: "CONFIRMED_PHYSICAL_INFRASTRUCTURE",
        explanation: "Subject Alternative Name TLS handshake negotiation leaked real clearnet router endpoint.",
        created_at: "2026-03-02T14:20:00Z"
      },
      {
        id: "rw-2",
        entity_name: "BSA 2023 Ledger Seal #ee6c44e6b227",
        entity_type: "court_admissible_anchor",
        relationship_type: "CRYPTOGRAPHIC_CUSTODY_CERTIFICATE",
        evidence: {
          sha256_hash: "ee6c44e6b2271b2644d2e8bb08eb14509eab32d2e68855727eecd884ee7cafae",
          section_65b_status: "VERIFIED",
          chain_blocks: 990
        },
        source: "SECTION_65B_CHAIN_OF_CUSTODY",
        source_record_id: "ledger-990",
        observed_at: new Date().toISOString(),
        confidence: "LEGAL_CERTAINTY_100%",
        explanation: "Cryptographically linked hash-chain guarantees zero tampering for court submission.",
        created_at: new Date().toISOString()
      }
    ]
  }
};

export const MOCK_CENTRAL_GRAPH = {
  total_nodes: 12,
  total_edges: 14,
  nodes: [
    {
      id: "actor_vektor",
      label: "Vektor Syndicate (Target)",
      type: "actor",
      details: {
        dacs_score: 100.0,
        verdict: "POSITIVE_ATTRIBUTION",
        explanation: "Primary de-anonymized actor profile linking 3 darknet handles.",
        hash: "ee6c44e6b2271b2644d2e8bb08eb14509eab32d2e68855727eecd884ee7cafae"
      }
    },
    {
      id: "h_vektor_ops",
      label: "vektor_ops (AlphaBay)",
      type: "handle",
      details: {
        platform: "AlphaBay_V2",
        explanation: "Vendor selling RATs and bulletproof VPN access on seized market."
      }
    },
    {
      id: "h_krypton_vendor",
      label: "krypton_vendor (Bohemia)",
      type: "handle",
      details: {
        platform: "BohemiaMarket",
        explanation: "Migrated vendor profile created 24.5h post-AlphaBay seizure."
      }
    },
    {
      id: "h_nexus_distro",
      label: "nexus_distro (Abacus)",
      type: "handle",
      details: {
        platform: "AbacusDarknet",
        explanation: "Syndicated backup handle sharing common-input UTXO wallets."
      }
    },
    {
      id: "w_btc_01",
      label: "bc1q9v8t...c4e6g8w",
      type: "wallet",
      details: {
        currency: "BTC",
        balance: "14.28 BTC",
        explanation: "Primary deposit wallet exhibiting pre-mixer micro-TX testing rituals."
      }
    },
    {
      id: "w_btc_02",
      label: "bc1qw508...kv8f3t4",
      type: "wallet",
      details: {
        currency: "BTC",
        explanation: "Co-spent wallet in common-input multi-sig UTXO transaction."
      }
    },
    {
      id: "pgp_key_01",
      label: "PGP: 92F4 81B3 E45C 70A1",
      type: "pgp",
      details: {
        fingerprint: "92F4 81B3 E45C 70A1 0D32 FB01 4C8A 9E2F 1120 4A77",
        explanation: "Identical PGP key used on both AlphaBay and Bohemia."
      }
    },
    {
      id: "onion_vektor",
      label: "vektor774kxqm...onion",
      type: "onion",
      details: {
        service: "Tor V3 Hidden Service",
        explanation: "Private escrow storefront discovered via MGRD forum crawl."
      }
    },
    {
      id: "ip_clearnet_01",
      label: "185.220.101.5 (Leaked IP)",
      type: "ip",
      details: {
        ip: "185.220.101.5",
        country: "Russia",
        isp: "Selectel PJSC",
        explanation: "Clearnet origin server leaked through misconfigured SSL SAN certificate."
      }
    },
    {
      id: "domain_breach_01",
      label: "auth.vektor-ops.ru",
      type: "breach",
      details: {
        domain: "auth.vektor-ops.ru",
        explanation: "Clearnet authentication portal matching TLS Subject Alternative Name."
      }
    },
    {
      id: "caa_stylometry",
      label: "P4: Burrows Delta (94.6%)",
      type: "cert",
      details: {
        z_score_similarity: "94.6%",
        explanation: "High-confidence syntactic certainty marker & argument structure match."
      }
    },
    {
      id: "bsa_evidence_anchor",
      label: "Sec 65B Seal #ee6c44",
      type: "evidence_anchor",
      details: {
        act: "Section 65B Indian Evidence Act / BSA 2023",
        status: "COURT_ADMISSIBLE_CERTIFIED",
        hash: "ee6c44e6b2271b2644d2e8bb08eb14509eab32d2e68855727eecd884ee7cafae"
      }
    }
  ],
  edges: [
    { source: "actor_vektor", target: "h_vektor_ops", label: "PRIMARY_ALIAS", type: "ATTRIBUTED", weight: 1.0 },
    { source: "actor_vektor", target: "h_krypton_vendor", label: "MIGRATED_ALIAS", type: "ATTRIBUTED", weight: 0.98 },
    { source: "actor_vektor", target: "h_nexus_distro", label: "SYNDICATE_ALIAS", type: "ATTRIBUTED", weight: 0.95 },
    { source: "h_vektor_ops", target: "pgp_key_01", label: "SIGNED_WITH_PGP", type: "CRYPTOGRAPHIC", weight: 1.0 },
    { source: "h_krypton_vendor", target: "pgp_key_01", label: "REUSED_PGP", type: "CRYPTOGRAPHIC", weight: 1.0 },
    { source: "h_vektor_ops", target: "w_btc_01", label: "DEPOSITS_TO", type: "FINANCIAL", weight: 0.95 },
    { source: "h_krypton_vendor", target: "w_btc_02", label: "DEPOSITS_TO", type: "FINANCIAL", weight: 0.95 },
    { source: "w_btc_01", target: "w_btc_02", label: "COMMON_INPUT_CLUSTER", type: "FINANCIAL", weight: 0.92 },
    { source: "h_vektor_ops", target: "onion_vektor", label: "HOSTS_STOREFRONT", type: "INFRASTRUCTURE", weight: 1.0 },
    { source: "onion_vektor", target: "ip_clearnet_01", label: "LEAKS_CLEARNET_IP", type: "CLEARNET_LEAK", weight: 1.0 },
    { source: "onion_vektor", target: "domain_breach_01", label: "TLS_SAN_CORRELATION", type: "REAL_WORLD_LINK", weight: 0.99 },
    { source: "h_vektor_ops", target: "caa_stylometry", label: "STYLISTIC_WRITENOTE", type: "COGNITIVE", weight: 0.946 },
    { source: "h_krypton_vendor", target: "caa_stylometry", label: "STYLISTIC_WRITENOTE", type: "COGNITIVE", weight: 0.946 },
    { source: "actor_vektor", target: "bsa_evidence_anchor", label: "SEALED_UNDER_BSA2023", type: "LEGAL", weight: 1.0 }
  ]
};

export const MOCK_TIMELINE: TimelineEvent[] = [
  {
    event_type: "MARKET_SEIZURE",
    occurred_at: "2026-02-14T12:00:00Z",
    summary: "Law enforcement takedown of AlphaBay V2 infrastructure executed.",
    actor_id: "ASTRA-ACTOR-001",
    source: "AlphaBay_V2",
    category: "Marketplace Takedown"
  },
  {
    event_type: "MIGRATION_WINDOW",
    occurred_at: "2026-02-15T12:30:00Z",
    summary: "New vendor 'krypton_vendor' appears on Bohemia Market with identical PGP key 24.5h later.",
    actor_id: "ASTRA-ACTOR-001",
    source: "BohemiaMarket",
    category: "P2 MGRD Migration"
  },
  {
    event_type: "INFRA_MISCONFIG",
    occurred_at: "2026-03-02T14:20:00Z",
    summary: "TLS certificate Subject Alternative Name handshake leaks clearnet IP 185.220.101.5.",
    actor_id: "ASTRA-ACTOR-001",
    source: "Tor V3 Probe",
    category: "P1 INFRA-SCAN"
  },
  {
    event_type: "CRYPTO_BREATHING",
    occurred_at: "2026-03-03T18:15:00Z",
    summary: "0.001 BTC pre-mixer testing ritual observed prior to Whirlpool CoinJoin pool entry.",
    actor_id: "ASTRA-ACTOR-001",
    source: "Bitcoin Blockchain",
    category: "P3 CMTBP"
  },
  {
    event_type: "BSA_LEDGER_SEAL",
    occurred_at: "2026-03-05T09:00:00Z",
    summary: "Section 65B court evidence certificate generated with SHA-256 seal ee6c44e6b227.",
    actor_id: "ASTRA-ACTOR-001",
    source: "Project ASTRA Custody Engine",
    category: "Legal Chain"
  }
];

export const MOCK_HIDDEN_SERVICES: HiddenServices = {
  summary: {
    hidden_services: 6,
    infrastructure_findings: 18,
    correlations: 14,
    linked_actors: 4
  },
  rows: [
    {
      id: "hs-1",
      onion_address: "vektor774kxqm9p2zt7y4b5q0c9v8t3z4x7p2m6k8h1n0s5d3f7j9a2c.onion",
      finding_type: "ssl_san_leak",
      detail: {
        jarm: "27d27d27d00027d1dc42d42d00042d87e0766e409cf9bbafb3e77f08cf2cb5",
        san_list: ["vektor-ops.onion", "auth.vektor-ops.ru", "185.220.101.5"],
        open_ports: [80, 443, 22]
      },
      resolved_ip: "185.220.101.5",
      discovered_at: "2026-03-02T14:20:00Z",
      actor_id: "ASTRA-ACTOR-001",
      actor_label: "Vektor Syndicate",
      correlations: [
        {
          source: "P1_INFRA_SCAN",
          matched_value: "185.220.101.5",
          description: "Clearnet origin server hosted by Selectel PJSC in Novosibirsk"
        }
      ]
    },
    {
      id: "hs-2",
      onion_address: "phantom48k9xm0p2zt7y4b5q0c9v8t3z4x7p2m6k8h1n0s5d3f7j9a2.onion",
      finding_type: "jarm_cluster_match",
      detail: {
        jarm: "15d3fd16d29129100042d42d000000a30b5d5d5d5d5d5d5d5d5d5d5d5d5d5d",
        open_ports: [80, 443]
      },
      resolved_ip: "194.26.29.114",
      discovered_at: "2026-03-03T11:00:00Z",
      actor_id: "ASTRA-ACTOR-002",
      actor_label: "Phantom Brokerage",
      correlations: [
        {
          source: "P1_INFRA_SCAN",
          matched_value: "194.26.29.114",
          description: "Leaked backup node in Saint Petersburg"
        }
      ]
    }
  ]
};

export const MOCK_ALERTS: Alert[] = [
  {
    alert_type: "high_confidence_actor",
    severity: "high",
    summary: "DACS Fusion achieved 100.0% Attribution Confidence for Vektor Syndicate across AlphaBay and Bohemia.",
    occurred_at: "2026-03-05T08:30:00Z",
    actor_id: "ASTRA-ACTOR-001"
  },
  {
    alert_type: "infra_finding",
    severity: "high",
    summary: "Tor hidden service SSL SAN misconfiguration exposed clearnet IP 185.220.101.5.",
    occurred_at: "2026-03-02T14:20:00Z",
    actor_id: "ASTRA-ACTOR-001"
  },
  {
    alert_type: "new_linkage",
    severity: "medium",
    summary: "Common-input UTXO clustering linked 2 previously unassociated darknet vendor deposit wallets.",
    occurred_at: "2026-03-03T18:15:00Z",
    actor_id: "ASTRA-ACTOR-001"
  }
];

export const MOCK_ATTRIBUTION: AttributionBreakdown = {
  signals: [
    { label: "P1: Tor Infrastructure & SAN Leak", value: 1.0, weight: 0.30, available: true },
    { label: "P2: MGRD Ghost Residue & PGP Reuse", value: 0.95, weight: 0.25, available: true },
    { label: "P3: CMTBP Micro-TX & Wallet Cluster", value: 0.92, weight: 0.25, available: true },
    { label: "P4: CAA Cognitive Stylometry Match", value: 0.946, weight: 0.20, available: true }
  ],
  evidence_count: 14,
  sources: ["AlphaBay_V2", "BohemiaMarket", "Bitcoin_Blockchain", "Tor_JARM_Scanner"]
};

export const MOCK_ENRICHMENT: ActorEnrichment = {
  platforms: [
    { platform: "AlphaBay_V2", identifier_count: 3, activity_count: 48, first_activity: "2025-11-12T00:00:00Z", last_activity: "2026-02-14T18:30:00Z" },
    { platform: "BohemiaMarket", identifier_count: 2, activity_count: 35, first_activity: "2026-02-15T19:00:00Z", last_activity: "2026-03-05T12:00:00Z" },
    { platform: "AbacusDarknet", identifier_count: 2, activity_count: 19, first_activity: "2026-02-20T04:15:00Z", last_activity: "2026-03-04T09:00:00Z" }
  ],
  total_activities: 102,
  classified_activities: 102,
  first_observed: "2025-11-12T00:00:00Z",
  last_observed: "2026-03-05T12:00:00Z",
  active_duration_days: 114,
  days_since_last_observed: 0,
  posting_frequency_per_week: 6.2,
  shared_wallet_across_platforms: true,
  shared_pgp_key_across_platforms: true,
  platform_migration_order: ["AlphaBay_V2", "BohemiaMarket", "AbacusDarknet"]
};

export const MOCK_THREAT_ACTIVITY: ActorThreatActivity = {
  summary: [
    { category: "malware_ransomware", category_label: "Malware & Ransomware Infrastructure", activity_count: 42, sources: ["AlphaBay_V2", "BohemiaMarket"] },
    { category: "carding_financial", category_label: "Stolen Banking Credentials & Dumps", activity_count: 28, sources: ["BohemiaMarket"] },
    { category: "bulletproof_hosting", category_label: "Bulletproof Darknet Relay Hosting", activity_count: 32, sources: ["AlphaBay_V2", "AbacusDarknet"] }
  ],
  activities: [
    {
      id: "act-1",
      actor_id: "ASTRA-ACTOR-001",
      persona_username: "vektor_ops",
      source_platform: "AlphaBay_V2",
      source_record_id: "listing-4412",
      title: "Stealth Bulletproof Reverse Proxy [100Gbps DDoS Shield]",
      observed_at: "2026-01-10T14:00:00Z",
      category: "bulletproof_hosting",
      category_label: "Bulletproof Darknet Relay Hosting",
      classification_reason: "Matches automated taxonomy keywords: bulletproof proxy, ddos shield, no-logs",
      classification_method: "keyword_rule",
      classification_confidence: "high"
    },
    {
      id: "act-2",
      actor_id: "ASTRA-ACTOR-001",
      persona_username: "krypton_vendor",
      source_platform: "BohemiaMarket",
      source_record_id: "listing-8812",
      title: "Cobalt Strike Payload Injector V4.9 - Clean FUD",
      observed_at: "2026-02-22T19:30:00Z",
      category: "malware_ransomware",
      category_label: "Malware & Ransomware Infrastructure",
      classification_reason: "Matches automated taxonomy keywords: cobalt strike, payload, fud injector",
      classification_method: "keyword_rule",
      classification_confidence: "high"
    }
  ],
  activities_total: 102,
  page: 1,
  page_size: 50
};
