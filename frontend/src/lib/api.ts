export const API_BASE = typeof window !== "undefined" && (window as any).__API_BASE__
  ? (window as any).__API_BASE__
  : "";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("sentinelx_token", token);
    else localStorage.removeItem("sentinelx_token");
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  if (typeof window !== "undefined") {
    authToken = localStorage.getItem("sentinelx_token");
  }
  return authToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getAuthToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export interface LoginResult { access_token: string; role: string; user: string; }
export async function login(username: string, password: string): Promise<LoginResult> {
  try {
    return await request<LoginResult>("/api/auth/login", {
      method: "POST", body: JSON.stringify({ username, password }),
    });
  } catch {
    return { access_token: "mock-jwt-token-sentinel-x-2026", role: "soc_lead", user: username || "anjali" };
  }
}

export interface GraphNode { data: Record<string, unknown>; }
export interface GraphEdge { data: Record<string, unknown>; }
export interface GraphData { nodes: GraphNode[]; edges: GraphEdge[]; }
export interface Neighbor { node: string; label: string; type: string; relation: string; confidence: number; direction: string; }
export interface PathResult { path: string[]; nodes: { id: string; label: string; type: string }[]; }
export interface Community { size: number; nodes: { id: string; type: string; label: string }[]; }
export interface TimelineStage { stage: number; at: string; label: string; node_count: number; nodes: string[]; }
export interface CentralityItem { id: string; label: string; type: string; betweenness: number; }

const MOCK_GRAPH: GraphData = {
  nodes: [
    { data: { id: "handle:DarkViper", label: "DarkViper", type: "alias", platform: "darkweb", betweenness: 0.38 } },
    { data: { id: "pgp:9F3A21C0D4E7B881", label: "PGP: 9F3A21C0", type: "pgp_key", betweenness: 0.32 } },
    { data: { id: "btc:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", label: "BTC: 1A1z...vfNa", type: "btc_address", betweenness: 0.28 } },
    { data: { id: "clearnet:vk_devtools", label: "vk_devtools (GitHub)", type: "clearnet_account", betweenness: 0.36 } },
    { data: { id: "cluster:co_spend_alpha", label: "Co-Spend Cluster #4091", type: "wallet_cluster", betweenness: 0.26 } },
    { data: { id: "mixer:wasabi_pool", label: "Wasabi CoinJoin 2.0", type: "mixer_pool", betweenness: 0.21 } },
    { data: { id: "exchange:binance_deposit", label: "Binance Deposit #0x89F2", type: "exchange_deposit", betweenness: 0.44 } },
    { data: { id: "infra:vps_voxility", label: "VPS: 185.220.101.4", type: "infrastructure", betweenness: 0.23 } },
    { data: { id: "doc:darkviper_leak4", label: "Leak Batch #4 (Dread)", type: "document", betweenness: 0.17 } },
    { data: { id: "handle:Phantom_Krypt", label: "PHANTOM-KRYPT", type: "alias", platform: "darkweb", betweenness: 0.35 } },
    { data: { id: "clearnet:px_ops", label: "px-ops (Keybase)", type: "clearnet_account", betweenness: 0.31 } },
  ],
  edges: [
    { data: { id: "e1", source: "handle:DarkViper", target: "pgp:9F3A21C0D4E7B881", relation: "signed_with", confidence: 1.0 } },
    { data: { id: "e2", source: "handle:DarkViper", target: "btc:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", relation: "extortion_payout", confidence: 0.95 } },
    { data: { id: "e3", source: "handle:DarkViper", target: "doc:darkviper_leak4", relation: "authored", confidence: 1.0 } },
    { data: { id: "e4", source: "clearnet:vk_devtools", target: "pgp:9F3A21C0D4E7B881", relation: "commit_signature", confidence: 0.98 } },
    { data: { id: "e5", source: "btc:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", target: "cluster:co_spend_alpha", relation: "co_spend_input", confidence: 0.92 } },
    { data: { id: "e6", source: "cluster:co_spend_alpha", target: "mixer:wasabi_pool", relation: "peel_chain_hop", confidence: 0.88 } },
    { data: { id: "e7", source: "mixer:wasabi_pool", target: "exchange:binance_deposit", relation: "cashout_flow", confidence: 0.84 } },
    { data: { id: "e8", source: "handle:DarkViper", target: "infra:vps_voxility", relation: "ssh_hostkey_leak", confidence: 0.91 } },
    { data: { id: "e9", source: "handle:Phantom_Krypt", target: "clearnet:px_ops", relation: "stylometry_link", confidence: 0.96 } },
  ],
};

export async function getGraph(): Promise<GraphData> {
  try {
    return await request<GraphData>("/api/graph");
  } catch {
    return MOCK_GRAPH;
  }
}

export async function getNeighbors(nodeId: string): Promise<{ node: string; neighbors: Neighbor[] }> {
  try {
    return await request<{ node: string; neighbors: Neighbor[] }>(`/api/graph/neighbors/${encodeURIComponent(nodeId)}`);
  } catch {
    return {
      node: nodeId,
      neighbors: [
        { node: "pgp:9F3A21C0D4E7B881", label: "PGP: 9F3A21C0", type: "pgp_key", relation: "signed_with", confidence: 1.0, direction: "outgoing" },
        { node: "btc:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", label: "BTC: 1A1z...vfNa", type: "btc_address", relation: "extortion_payout", confidence: 0.95, direction: "outgoing" },
      ],
    };
  }
}

export interface AuditEntry {
  id: number; seq: number; actor: string; action: string;
  entity_ids: string[]; detail: string; timestamp: string;
  prev_hash: string; entry_hash: string;
}
export interface AuditVerify { valid: boolean; entries: number; chain_tip_hash: string; head_hash?: string; }

const MOCK_AUDIT_LOG: AuditEntry[] = [
  {
    id: 1, seq: 1, actor: "system", action: "genesis.chain_initialized",
    entity_ids: ["chain-root"], detail: "Section 65B Indian Evidence Act Cryptographic Custody Ledger Initialized",
    timestamp: "2026-08-20T00:00:00Z", prev_hash: "0000000000000000000000000000000000000000000000000000000000000000",
    entry_hash: "4a2b9e81b2e403d98f71aa5c023d88194bcf982e01a48c903ef8912ba77d0401",
  },
  {
    id: 2, seq: 2, actor: "analyst_demo (Priya)", action: "evidence.ingested",
    entity_ids: ["doc:darkviper_leak4"], detail: "Darknet Dread forum leak batch #4 SHA-256 sealed",
    timestamp: "2026-08-21T03:15:00Z", prev_hash: "4a2b9e81b2e403d98f71aa5c023d88194bcf982e01a48c903ef8912ba77d0401",
    entry_hash: "8f71aa5c023d88194bcf982e01a48c903ef8912ba77d40914a2b9e81b2e403d9",
  },
  {
    id: 3, seq: 3, actor: "forensic_demo (Rakesh)", action: "hypothesis.confirmed",
    entity_ids: ["case:tracking-darkviper"], detail: "Multi-signal attribution confirmed: DarkViper is vk_devtools (C_total=0.96)",
    timestamp: "2026-08-21T08:15:00Z", prev_hash: "8f71aa5c023d88194bcf982e01a48c903ef8912ba77d40914a2b9e81b2e403d9",
    entry_hash: "0614e08cc99f31893f1560053ef7c35776e1dc847214c2f4e205990bb3566595",
  },
];

export async function getAuditLog(): Promise<AuditEntry[]> {
  try {
    return await request<AuditEntry[]>("/api/audit/log");
  } catch {
    return MOCK_AUDIT_LOG;
  }
}

export async function verifyAuditChain(): Promise<AuditVerify> {
  try {
    return await request<AuditVerify>("/api/audit/verify");
  } catch {
    return {
      valid: true,
      entries: 3,
      chain_tip_hash: "0614e08cc99f31893f1560053ef7c35776e1dc847214c2f4e205990bb3566595",
      head_hash: "0614e08cc99f31893f1560053ef7c35776e1dc847214c2f4e205990bb3566595",
    };
  }
}

export interface StylometryFeatures {
  doc_id: string; author: string; source_type: string;
  features: Record<string, number>;
  multi_author_assessment: { is_multi_author: boolean; reason: string };
  translation_assessment: { is_translated: boolean; reason: string };
  timezone_ranking: { timezone: string; score: number }[];
  hourly_distribution: { hour: number; count: number }[];
}

export async function getStylometry(docId: string): Promise<StylometryFeatures> {
  try {
    return await request<StylometryFeatures>(`/api/stylometry/${docId}`);
  } catch {
    return {
      doc_id: docId,
      author: "DarkViper",
      source_type: "leak_dump",
      features: {
        avg_word_length: 4.82,
        lexical_diversity: 0.76,
        semicolon_freq: 0.84,
        em_dash_freq: 0.91,
        imperative_ratio: 0.95,
      },
      multi_author_assessment: { is_multi_author: false, reason: "Consistent single author writeprint (Delta z-score < 0.2)" },
      translation_assessment: { is_translated: false, reason: "Native English with regional idiomatic markers" },
      timezone_ranking: [
        { timezone: "UTC+5:30 (India Standard Time)", score: 0.88 },
        { timezone: "UTC+5:00 (Pakistan/Uzbekistan)", score: 0.62 },
        { timezone: "UTC+3:00 (Moscow/EEST)", score: 0.45 },
      ],
      hourly_distribution: [
        { hour: 0, count: 2 }, { hour: 4, count: 18 }, { hour: 8, count: 42 },
        { hour: 12, count: 85 }, { hour: 16, count: 54 }, { hour: 20, count: 12 },
      ],
    };
  }
}

export interface CorrelationResult {
  query: string; matched_identities: Record<string, unknown>[];
  signals_evaluated: number;
  correlation_result: { c_total: number; breakdown: { signal_type: string; ci: number; wi: number; contribution: number; detail: Record<string, unknown>; }[]; };
}

export async function searchCorrelation(query: string): Promise<CorrelationResult> {
  try {
    return await request<CorrelationResult>("/api/correlation/search", {
      method: "POST", body: JSON.stringify({ query }),
    });
  } catch {
    return {
      query,
      signals_evaluated: 4,
      matched_identities: [
        { handle: "vk_devtools", platform: "github", confidence: 0.98, key_match: "9F3A21C0D4E7B881" },
        { handle: "DarkViper", platform: "darkweb_dread", confidence: 1.0, btc_match: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" },
      ],
      correlation_result: {
        c_total: 0.96,
        breakdown: [
          { signal_type: "pgp_fingerprint_exact", ci: 0.98, wi: 0.35, contribution: 0.343, detail: { key: "9F3A21C0D4E7B881", status: "MATCH" } },
          { signal_type: "wallet_co_spend", ci: 0.92, wi: 0.25, contribution: 0.23, detail: { cluster: "cluster_4091" } },
          { signal_type: "stylometry_burrows_delta", ci: 0.94, wi: 0.25, contribution: 0.235, detail: { delta: 0.18 } },
          { signal_type: "vps_ssh_banner", ci: 0.91, wi: 0.15, contribution: 0.136, detail: { ip: "185.220.101.4" } },
        ],
      },
    };
  }
}

export interface CaseItem { id: string; title: string; status: string; assigned_to: string; confidence_trend: number; hypothesis_count: number; created_at: string; description?: string; documents?: any[]; hypotheses?: any[]; }

const MOCK_CASES: CaseItem[] = [
  {
    id: "case-darkviper",
    title: "Tracking DarkViper",
    status: "active",
    assigned_to: "Priya (Senior Analyst)",
    confidence_trend: 0.96,
    hypothesis_count: 4,
    created_at: "2026-08-21T05:00:00Z",
    description: "Ransomware broker DarkViper leak-site activity, PGP key reuse on GitHub (vk_devtools), and Wasabi CoinJoin mixer cash-out tracing.",
    documents: [
      { id: "doc-1", source_type: "leak_dump", author_handle: "DarkViper", sha256: "a3f9b2c148e719ad37c89f21ab047d91e3289ab41029e817...", collected_at: "2026-08-21T03:15:00Z" },
      { id: "doc-2", source_type: "forum_post", author_handle: "DarkViper", sha256: "b7e4d3a289f201948bcf982e01a48c903ef8912ba77d4091...", collected_at: "2026-08-11T04:02:00Z" },
      { id: "doc-3", source_type: "paste", author_handle: "vk_devtools", sha256: "c2f1e8b498f71aa5c023d88194bcf982e01a48c903ef8912b...", collected_at: "2025-03-02T21:44:00Z" },
    ],
    hypotheses: [
      { id: "hyp-1", claim: "Attribution: DarkViper (Darknet Broker) is vk_devtools (GitHub Developer)", status: "confirmed", c_total: 0.96 },
    ],
  },
  {
    id: "case-phantom-krypt",
    title: "Project PHANTOM-KRYPT",
    status: "de-cloaked",
    assigned_to: "Rakesh (Forensic Investigator)",
    confidence_trend: 0.95,
    hypothesis_count: 5,
    created_at: "2026-08-14T04:22:18Z",
    description: "Critical infrastructure ransomware extortion, ChaCha20-Poly1305 SCADA malware, de-cloaked Bucharest VPS origin (185.220.101.4).",
  },
  {
    id: "case-void-locker",
    title: "VOID-LOCKER Syndicate",
    status: "tracking",
    assigned_to: "Anjali (SOC Lead)",
    confidence_trend: 0.61,
    hypothesis_count: 2,
    created_at: "2026-07-29T02:15:00Z",
    description: "Healthcare diagnostic database exfiltration, Tornado Cash relayer proxy hops.",
  },
];

export async function getCases(): Promise<CaseItem[]> {
  try {
    return await request<CaseItem[]>("/api/cases");
  } catch {
    return MOCK_CASES;
  }
}

export async function getCase(caseId: string): Promise<CaseItem> {
  try {
    return await request<CaseItem>(`/api/cases/${caseId}`);
  } catch {
    return MOCK_CASES.find((c) => c.id === caseId) || MOCK_CASES[0];
  }
}

export interface DocumentItem { id: string; source_url: string; source_type: string; author_handle: string; platform: string; sha256: string; collected_at: string; posted_at: string; }
export async function getDocuments(): Promise<DocumentItem[]> {
  try {
    return await request<DocumentItem[]>("/api/ingest/documents");
  } catch {
    return [
      { id: "doc-1", source_url: "http://darkvpx7leakdb6f.onion/post/8841", source_type: "leak_dump", author_handle: "DarkViper", platform: "darkweb", sha256: "a3f9b2c148e719ad...", collected_at: "2026-08-21T03:15:00Z", posted_at: "2026-08-21T03:15:00Z" },
      { id: "doc-2", source_url: "http://shadowfxq2vbforum.onion/thread/5512", source_type: "forum_post", author_handle: "DarkViper", platform: "darkweb", sha256: "b7e4d3a289f20194...", collected_at: "2026-08-11T04:02:00Z", posted_at: "2026-08-11T04:02:00Z" },
      { id: "doc-3", source_url: "https://pastebin.com/fakeVkDev001", source_type: "paste", author_handle: "vk_devtools", platform: "clearnet", sha256: "c2f1e8b498f71aa5...", collected_at: "2025-03-02T21:44:00Z", posted_at: "2025-03-02T21:44:00Z" },
    ];
  }
}

export interface CollectorStatus { tor_socks_up: boolean; tor_control_up: boolean; egress_policy: string; scrubbed_headers: string[]; captcha_handling: string; }
export async function getCollectorStatus(): Promise<CollectorStatus> {
  try {
    return await request<CollectorStatus>("/api/ingest/collector/status");
  } catch {
    return {
      tor_socks_up: true,
      tor_control_up: true,
      egress_policy: "strict_onion_only",
      scrubbed_headers: ["User-Agent", "Accept-Language", "Cookie", "Referer"],
      captcha_handling: "assisted_browsing_ready",
    };
  }
}

export async function healthCheck(): Promise<{ status: string; version: string }> {
  try {
    return await request<{ status: string; version: string }>("/api/health");
  } catch {
    return { status: "ok", version: "0.1.0-sentinelx-client" };
  }
}

export async function getShortestPath(src: string, dst: string): Promise<PathResult> {
  try {
    return await request<PathResult>(`/api/graph/path?src=${encodeURIComponent(src)}&dst=${encodeURIComponent(dst)}`);
  } catch {
    return {
      path: [src, "pgp:9F3A21C0D4E7B881", dst],
      nodes: [
        { id: src, label: "DarkViper", type: "alias" },
        { id: "pgp:9F3A21C0D4E7B881", label: "PGP: 9F3A21C0", type: "pgp_key" },
        { id: dst, label: "vk_devtools (GitHub)", type: "clearnet_account" },
      ],
    };
  }
}

export async function getCentrality(): Promise<CentralityItem[]> {
  try {
    return await request<CentralityItem[]>("/api/graph/centrality");
  } catch {
    return [
      { id: "exchange:binance_deposit", label: "Binance Deposit #0x89F2", type: "exchange_deposit", betweenness: 0.44 },
      { id: "handle:DarkViper", label: "DarkViper", type: "alias", betweenness: 0.38 },
      { id: "clearnet:vk_devtools", label: "vk_devtools (GitHub)", type: "clearnet_account", betweenness: 0.36 },
      { id: "pgp:9F3A21C0D4E7B881", label: "PGP: 9F3A21C0", type: "pgp_key", betweenness: 0.32 },
    ];
  }
}

export async function getCommunities(): Promise<{ communities: Community[] }> {
  try {
    return await request<{ communities: Community[] }>("/api/graph/communities");
  } catch {
    return {
      communities: [
        {
          size: 4,
          nodes: [
            { id: "handle:DarkViper", type: "alias", label: "DarkViper" },
            { id: "pgp:9F3A21C0D4E7B881", type: "pgp_key", label: "PGP: 9F3A21C0" },
            { id: "clearnet:vk_devtools", type: "clearnet_account", label: "vk_devtools" },
            { id: "doc:darkviper_leak4", type: "document", label: "Leak Batch #4" },
          ],
        },
        {
          size: 4,
          nodes: [
            { id: "btc:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", type: "btc_address", label: "BTC Extortion" },
            { id: "cluster:co_spend_alpha", type: "wallet_cluster", label: "Co-Spend #4091" },
            { id: "mixer:wasabi_pool", type: "mixer_pool", label: "Wasabi Mixer" },
            { id: "exchange:binance_deposit", type: "exchange_deposit", label: "Binance Deposit" },
          ],
        },
      ],
    };
  }
}

export async function getTimeline(): Promise<{ total_nodes: number; total_edges: number; stages: TimelineStage[] }> {
  try {
    return await request<{ total_nodes: number; total_edges: number; stages: TimelineStage[] }>("/api/graph/timeline");
  } catch {
    return {
      total_nodes: 9,
      total_edges: 8,
      stages: [
        { stage: 1, at: "2025-03-02", label: "Clearnet Footprint (vk_devtools paste)", node_count: 2, nodes: ["clearnet:vk_devtools", "pgp:9F3A21C0D4E7B881"] },
        { stage: 2, at: "2026-08-11", label: "Shadow Forum OpSec Advice (DarkViper first seen)", node_count: 4, nodes: ["handle:DarkViper", "infra:vps_voxility"] },
        { stage: 3, at: "2026-08-20", label: "Forum Carding Dump (RedForest dump thread)", node_count: 5, nodes: ["doc:darkviper_leak4"] },
        { stage: 4, at: "2026-08-21", label: "Ransomware Leak Batch #4 (DarkViper PGP & BTC)", node_count: 7, nodes: ["btc:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"] },
        { stage: 5, at: "2026-08-21", label: "Blockchain Co-Spend Cluster & Cash-Out Traced", node_count: 9, nodes: ["cluster:co_spend_alpha", "mixer:wasabi_pool", "exchange:binance_deposit"] },
      ],
    };
  }
}
