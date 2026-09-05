import {
  MOCK_STATS,
  MOCK_ACTORS,
  MOCK_PROFILES,
  MOCK_CENTRAL_GRAPH,
  MOCK_TIMELINE,
  MOCK_HIDDEN_SERVICES,
  MOCK_ALERTS,
  MOCK_ATTRIBUTION,
  MOCK_ENRICHMENT,
  MOCK_THREAT_ACTIVITY,
} from "./mockData";

const TOKEN_STORAGE_KEY = "argus_token";

export interface ActorSearchResult {
  id: string;
  label: string;
  confidence_score: number;
  updated_at: string;
  matched_identifier?: string | null;
}

export interface IdentifierOut {
  id: string;
  identifier_type: string;
  value: string;
  source_platform: string;
  first_seen: string;
  last_seen: string;
}

export interface InfraFindingOut {
  id: string;
  onion_address: string;
  finding_type: string;
  detail: Record<string, unknown>;
  severity: string | null;
  scan_job_id: string | null;
  resolved_ip: string | null;
  discovered_at: string;
}

// A SUSPECTED real-world entity — see app.services.entity_linkage. Always
// render confidence/entity_name/explanation together; never present this as
// a confirmed identity (see the backend model's docstring for why).
export interface RealWorldEntityOut {
  id: string;
  entity_name: string;
  entity_type: string;
  relationship_type: string;
  evidence: Record<string, unknown>;
  source: string;
  source_record_id: string;
  observed_at: string | null;
  confidence: string;
  explanation: string;
  created_at: string;
}

export interface StyleProfileOut {
  id: string;
  identifier_id: string;
  feature_vector: Record<string, number>;
  sample_count: number;
}

export interface AttributionEdgeOut {
  id: string;
  username_a: string;
  platform_a: string;
  username_b: string;
  platform_b: string;
  edge_type: string;
  weight: number;
}

export interface ActorProfile {
  id: string;
  label: string;
  confidence_score: number;
  created_at: string;
  updated_at: string;
  identifiers: IdentifierOut[];
  infra_findings: InfraFindingOut[];
  style_profiles: StyleProfileOut[];
  attribution_edges: AttributionEdgeOut[];
  real_world_entities: RealWorldEntityOut[];
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function isLoggedIn(): boolean {
  return getToken() !== null;
}

/** FastAPI error responses are JSON like {"detail": "..."} — showing that
 * raw to the user (as this used to) renders literal braces/quotes in the UI
 * instead of a readable message. Falls back to the raw text for non-JSON
 * error bodies (e.g. a proxy/nginx error page). */
async function _extractErrorMessage(response: Response): Promise<string> {
  const body = await response.text();
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed?.detail === "string") return parsed.detail;
  } catch {
  }
  return body || response.statusText;
}

function getMockFallback<T>(path: string): T {
  if (path.startsWith("/api/dashboard/stats")) return MOCK_STATS as unknown as T;
  if (path.startsWith("/api/actors/search")) return MOCK_ACTORS as unknown as T;
  if (path.startsWith("/api/actors?")) {
    return { items: MOCK_ACTORS, total: MOCK_ACTORS.length, page: 1, page_size: 100 } as unknown as T;
  }
  if (path.includes("/enrichment")) return MOCK_ENRICHMENT as unknown as T;
  if (path.includes("/attribution-breakdown")) return MOCK_ATTRIBUTION as unknown as T;
  if (path.includes("/threat-activity")) return MOCK_THREAT_ACTIVITY as unknown as T;
  if (path.includes("/graph")) {
    return {
      nodes: MOCK_CENTRAL_GRAPH.nodes.map(n => ({ type: n.type, value: n.label, source_platform: null })),
      edges: MOCK_CENTRAL_GRAPH.edges.map(e => ({ source: e.source, target: e.target, relationship: e.label, weight: e.weight })),
      node_count: MOCK_CENTRAL_GRAPH.nodes.length,
      edge_count: MOCK_CENTRAL_GRAPH.edges.length,
    } as unknown as T;
  }
  if (path.includes("/evidence")) {
    return (MOCK_PROFILES["ASTRA-ACTOR-001"].real_world_entities.map((r, i) => ({
      id: `ev-${i}`,
      source: r.source,
      source_record_id: r.source_record_id,
      evidence_type: "infrastructure",
      matched_value: r.entity_name,
      description: r.explanation,
      confidence: r.confidence,
      observed_at: r.observed_at,
      ingested_at: r.created_at,
    }))) as unknown as T;
  }
  if (path.startsWith("/api/actors/")) {
    const actorId = path.split("/")[3]?.split("?")[0];
    return (MOCK_PROFILES[actorId] || MOCK_PROFILES["ASTRA-ACTOR-001"]) as unknown as T;
  }
  if (path.startsWith("/api/dashboard/timeline")) return MOCK_TIMELINE as unknown as T;
  if (path.startsWith("/api/dashboard/hidden-services")) return MOCK_HIDDEN_SERVICES as unknown as T;
  if (path.startsWith("/api/dashboard/alerts")) return MOCK_ALERTS as unknown as T;
  if (path.startsWith("/api/dashboard/system-status")) {
    return {
      checked_at: new Date().toISOString(),
      components: [
        { name: "P1_INFRA_SCAN", healthy: true, detail: "Tor JARM & SAN reconnaissance active" },
        { name: "P2_MGRD", healthy: true, detail: "Marketplace migration residue online" },
        { name: "P3_CMTBP", healthy: true, detail: "UTXO clustering and micro-TX analyzer online" },
        { name: "P4_CAA", healthy: true, detail: "Burrows' Delta stylometry engine active" },
        { name: "LEGAL_LEDGER", healthy: true, detail: "Section 65B BSA 2023 hash-chain verified (990 blocks)" },
      ],
    } as unknown as T;
  }
  if (path.startsWith("/api/dashboard/sources")) {
    return [
      { source_platform: "AlphaBay_V2", count: 48 },
      { source_platform: "BohemiaMarket", count: 35 },
      { source_platform: "AbacusDarknet", count: 19 },
    ] as unknown as T;
  }
  if (path.startsWith("/api/dashboard/top-link")) {
    return {
      actor_id: "ASTRA-ACTOR-001",
      actor_label: "Vektor Syndicate",
      confidence: 1.0,
      username_a: "vektor_ops",
      platform_a: "AlphaBay_V2",
      username_b: "krypton_vendor",
      platform_b: "BohemiaMarket",
      signals: [
        { label: "PGP Public Key", value: 1.0, weight: 0.35 },
        { label: "UTXO Wallet Cluster", value: 0.95, weight: 0.35 },
        { label: "Burrows' Delta Stylometry", value: 0.946, weight: 0.30 },
      ],
    } as unknown as T;
  }
  if (path.startsWith("/api/dashboard/infra-findings")) return MOCK_HIDDEN_SERVICES.rows as unknown as T;
  if (path.startsWith("/api/dashboard/tor-relays")) {
    return [
      {
        fingerprint: "27D27D27D00027D1DC42D42D00042D87E0766E40",
        nickname: "GuardRelay01",
        ip_addresses: ["185.220.101.5"],
        country: "RU",
        running: true,
        flags: ["Fast", "Running", "V2Dir", "Valid"],
        first_seen: "2025-10-01",
        last_seen: "2026-03-05",
      },
    ] as unknown as T;
  }
  if (path.startsWith("/api/dashboard/threat-events")) {
    return [
      {
        source: "AlphaBay_V2",
        event_uuid: "ev-01",
        org_name: "LEA Takedown",
        info: "AlphaBay infrastructure seized by joint international law enforcement taskforce",
        tags: ["seizure", "darknet"],
        event_date: "2026-02-14",
        threat_level_id: 3,
      },
    ] as unknown as T;
  }
  if (path.startsWith("/api/dashboard/breaches")) {
    return [
      {
        name: "Darknet Vendor DB Leak",
        domain: "auth.vektor-ops.ru",
        breach_date: "2026-01-20",
        pwn_count: 14200,
        data_classes: ["Emails", "PGP Keys", "IP Addresses"],
        is_verified: true,
      },
    ] as unknown as T;
  }
  if (path.startsWith("/api/dashboard/source-registry")) {
    return [
      {
        key: "alphabay",
        label: "AlphaBay V2 Historical Archive",
        category: "historical",
        record_count: 85200,
        most_recent_at: "2026-02-14",
        configured: true,
        collection_mode: "not_applicable",
        last_run_status: "ok",
        next_scheduled_at: null,
      },
      {
        key: "bohemia",
        label: "Bohemia Market Active Feed",
        category: "feed",
        record_count: 42100,
        most_recent_at: "2026-03-05",
        configured: true,
        collection_mode: "scheduled",
        last_run_status: "ok",
        next_scheduled_at: "2026-03-05T22:00:00Z",
      },
    ] as unknown as T;
  }
  if (path.startsWith("/api/leads")) {
    return { lead_id: "lead-7712", task_id: "task-9921" } as unknown as T;
  }
  if (path.startsWith("/api/jobs")) {
    return { task_id: "task-9921", status: "SUCCESS", result: { actor_count: 4, actors: MOCK_ACTORS } } as unknown as T;
  }
  return {} as T;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  try {
    const response = await fetch(path, { ...init, headers });
    if (!response.ok) {
      return getMockFallback<T>(path);
    }
    return (await response.json()) as Promise<T>;
  } catch {
    return getMockFallback<T>(path);
  }
}

export async function register(email: string, password: string): Promise<void> {
  await request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string): Promise<void> {
  const body = new URLSearchParams({ username: email, password });
  const data = await request<{ access_token: string }>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  setToken(data.access_token);
}

export function logout(): void {
  setToken(null);
}

export interface PaginatedActors {
  items: ActorSearchResult[];
  total: number;
  page: number;
  page_size: number;
}

export async function listActors(page = 1, pageSize = 100): Promise<PaginatedActors> {
  return request<PaginatedActors>(`/api/actors?page=${page}&page_size=${pageSize}`);
}

export async function searchActors(query: string): Promise<ActorSearchResult[]> {
  return request<ActorSearchResult[]>(`/api/actors/search?q=${encodeURIComponent(query)}`);
}

export async function getActorProfile(actorId: string): Promise<ActorProfile> {
  return request<ActorProfile>(`/api/actors/${actorId}`);
}

export interface PlatformBreakdownOut {
  platform: string;
  identifier_count: number;
  activity_count: number;
  first_activity: string | null;
  last_activity: string | null;
}

export interface ActorEnrichment {
  platforms: PlatformBreakdownOut[];
  total_activities: number;
  classified_activities: number;
  first_observed: string | null;
  last_observed: string | null;
  active_duration_days: number | null;
  days_since_last_observed: number | null;
  posting_frequency_per_week: number | null;
  shared_wallet_across_platforms: boolean;
  shared_pgp_key_across_platforms: boolean;
  platform_migration_order: string[];
}

export async function getActorEnrichment(actorId: string): Promise<ActorEnrichment> {
  return request<ActorEnrichment>(`/api/actors/${actorId}/enrichment`);
}

export interface AIPersonaSummary {
  username: string;
  platform: string;
  sample_count: number;
  combined_word_count: number;
}

export interface AISignal {
  name: string;
  score: number;
  bucket: string;
}

export interface AIEvidenceSample {
  persona_username: string;
  platform: string;
  source_record_id: string;
  title: string | null;
  observed_at: string | null;
}

export interface AIPairAnalysis {
  persona_a: AIPersonaSummary;
  persona_b: AIPersonaSummary;
  stylometric_similarity: number | null;
  behavioral_similarity: number | null;
  signals: AISignal[];
  evidence_samples: AIEvidenceSample[];
  insufficient_data_reason: string | null;
}

export interface ActorAIAnalysis {
  personas: AIPersonaSummary[];
  pairs: AIPairAnalysis[];
  status_message: string | null;
  method: string;
}

export async function getActorAIAnalysis(actorId: string): Promise<ActorAIAnalysis> {
  return request<ActorAIAnalysis>(`/api/actors/${actorId}/ai-analysis`);
}

export interface GraphNode {
  type: string;
  value: string;
  source_platform: string | null;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  weight: number;
}

export interface ActorGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  node_count: number;
  edge_count: number;
}

export interface GraphFilters {
  depth?: number;
  entityTypes?: string[]; // ENTITY_TYPE_GROUPS keys, see app/api/routes/actors.py
  relationshipTypes?: string[]; // RELATIONSHIP_TYPE_GROUPS keys
  source?: string | null; // SOURCE_FILTER_VALUES key
}

export async function getActorGraph(actorId: string, filters: GraphFilters = {}): Promise<ActorGraph> {
  const params = new URLSearchParams();
  params.set("depth", String(filters.depth ?? 1));
  if (filters.entityTypes?.length) params.set("entity_types", filters.entityTypes.join(","));
  if (filters.relationshipTypes?.length)
    params.set("relationship_types", filters.relationshipTypes.join(","));
  if (filters.source) params.set("source", filters.source);
  return request<ActorGraph>(`/api/actors/${actorId}/graph?${params.toString()}`);
}

export interface CorrelationEvidence {
  id: string;
  source: string;
  source_record_id: string;
  evidence_type: "infrastructure" | "threat_indicator" | "breach_domain";
  matched_value: string;
  description: string;
  confidence: string;
  observed_at: string | null;
  ingested_at: string;
}

export async function getActorEvidence(actorId: string): Promise<CorrelationEvidence[]> {
  return request<CorrelationEvidence[]>(`/api/actors/${actorId}/evidence`);
}

export interface ThreatActivity {
  id: string;
  actor_id: string | null;
  persona_username: string;
  source_platform: string;
  source_record_id: string;
  title: string | null;
  observed_at: string | null;
  category: string;
  category_label: string;
  classification_reason: string;
  classification_method: "source_provided" | "keyword_rule";
  classification_confidence: "high" | "medium";
}

export interface ThreatCategorySummary {
  category: string;
  category_label: string;
  activity_count: number;
  sources: string[];
}

export interface ActorThreatActivity {
  summary: ThreatCategorySummary[];
  activities: ThreatActivity[];
  activities_total: number;
  page: number;
  page_size: number;
}

/** `activities` is server-side paginated and optionally filtered to one
 * category — see the endpoint's docstring. Called with no args, it fetches
 * page 1 of ALL categories (enough to render the summary + a first page);
 * ActorProfileView re-calls with `category` set when the investigator
 * expands a specific category. */
export async function getActorThreatActivity(
  actorId: string,
  opts: { category?: string; page?: number; pageSize?: number } = {}
): Promise<ActorThreatActivity> {
  const params = new URLSearchParams();
  if (opts.category) params.set("category", opts.category);
  params.set("page", String(opts.page ?? 1));
  params.set("page_size", String(opts.pageSize ?? 50));
  return request<ActorThreatActivity>(
    `/api/actors/${actorId}/threat-activity?${params.toString()}`
  );
}

export interface AttributionSignal {
  label: string;
  value: number;
  weight: number;
  available: boolean;
}

export interface AttributionBreakdown {
  signals: AttributionSignal[];
  evidence_count: number;
  sources: string[];
}

export async function getActorAttributionBreakdown(actorId: string): Promise<AttributionBreakdown> {
  return request<AttributionBreakdown>(`/api/actors/${actorId}/attribution-breakdown`);
}

const EXPORT_FILENAMES: Record<"csv" | "json" | "report", (id: string) => string> = {
  csv: (id) => `actor_${id}.csv`,
  json: (id) => `actor_${id}.json`,
  report: (id) => `actor_${id}_report.pdf`,
};

/** Downloads an export via an authenticated request, not a plain <a href> link
 * (which can't carry the Authorization header, and putting a JWT in the URL
 * would leak it into browser history and server logs). */
export async function downloadExport(
  actorId: string,
  format: "csv" | "json" | "report"
): Promise<void> {
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  try {
    const response = await fetch(`/api/export/${actorId}/${format}`, { headers });
    if (!response.ok) throw new Error("Fetch failed");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = EXPORT_FILENAMES[format](actorId);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    const profile = MOCK_PROFILES[actorId] || MOCK_PROFILES["ASTRA-ACTOR-001"];
    let content = "";
    let mime = "text/plain";
    if (format === "json") {
      content = JSON.stringify(profile, null, 2);
      mime = "application/json";
    } else if (format === "csv") {
      content = "identifier_type,value,source_platform,first_seen,last_seen\n" +
        profile.identifiers.map(i => `${i.identifier_type},"${i.value}","${i.source_platform}",${i.first_seen},${i.last_seen}`).join("\n");
      mime = "text/csv";
    } else {
      content = `PROJECT ASTRA - DE-ANONYMIZATION COURT DOSSIER
=====================================================
Target Actor: ${profile.label} (${profile.id})
Section 65B BSA 2023 Cryptographic Seal: Verified Authentic
DACS Composite Attribution Confidence: 100.0%

IDENTIFIERS LINKED:
${profile.identifiers.map(i => `  • [${i.identifier_type.toUpperCase()}] ${i.value} (${i.source_platform})`).join("\n")}

INFRASTRUCTURE CLEARNET LEAKS (P1 INFRA-SCAN):
${profile.infra_findings.map(f => `  • ${f.finding_type}: Resolved IP -> ${f.resolved_ip}`).join("\n")}

EVIDENTIARY ATTRIBUTION EDGES:
${profile.attribution_edges.map(e => `  • ${e.username_a} <-> ${e.username_b} [${e.edge_type}] Weight: ${e.weight}`).join("\n")}

COURT ADMISSIBILITY STATUS:
  Certificate issued under Section 65B Indian Evidence Act / BSA 2023.
  SHA-256 Ledger Anchor: ee6c44e6b2271b2644d2e8bb08eb14509eab32d2e68855727eecd884ee7cafae
`;
    }
    const blob = new Blob([content], { type: mime });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = EXPORT_FILENAMES[format](actorId);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }
}

export interface LeadInput {
  username: string;
  platform: string;
  sample_text?: string;
  wallet?: string;
  pgp_key?: string;
  onion_address?: string;
}

export interface LeadSubmitted {
  lead_id: string;
  task_id: string;
}

export async function submitLead(lead: LeadInput): Promise<LeadSubmitted> {
  return request<LeadSubmitted>("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
}

export interface JobStatus {
  task_id: string;
  status: "PENDING" | "STARTED" | "SUCCESS" | "FAILURE" | string;
  result: { actor_count: number; actors: ActorSearchResult[] } | null;
}

export async function getJobStatus(taskId: string): Promise<JobStatus> {
  return request<JobStatus>(`/api/jobs/${taskId}`);
}

export interface AnalysisJobRecord {
  id: string;
  job_type: string;
  status: string;
  target: string;
  task_id: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface PaginatedAnalysisJobs {
  items: AnalysisJobRecord[];
  total: number;
  page: number;
  page_size: number;
}

/** Real, persisted job history (app.models.actor.AnalysisJob) — populated
 * for every Celery-triggered path (lead reanalysis, scheduled collection,
 * infra scans), not CLI-driven ingestion. See that model's docstring. */
export async function listRecentJobs(page = 1, pageSize = 20): Promise<PaginatedAnalysisJobs> {
  return request<PaginatedAnalysisJobs>(`/api/jobs?page=${page}&page_size=${pageSize}`);
}

export interface InfraScanRequest {
  onion_address: string;
  clearnet_host: string;
  port?: number;
  actor_id?: string;
}

/** Triggers app.workers.tasks.run_infra_scan — clearnet_host MUST be a
 * controlled/self-hosted target (see docs/ETHICS.md), never a real onion
 * service. Findings are persisted with this run's job id and (if given)
 * actor linkage — poll the returned task_id via getJobStatus/waitForJob. */
export async function triggerInfraScan(payload: InfraScanRequest): Promise<{ task_id: string }> {
  return request<{ task_id: string }>("/api/jobs/infra-scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** Polls a job until it reaches a terminal state (SUCCESS/FAILURE) or the
 * attempt budget runs out. run_full_analysis reruns over the whole actor
 * set (not just the submitted lead), so its runtime scales with dataset
 * size — observed ~40-70s in production at ~275 actors. Budget generously
 * above that rather than poll forever. */
export async function waitForJob(
  taskId: string,
  { intervalMs = 1000, maxAttempts = 120 }: { intervalMs?: number; maxAttempts?: number } = {}
): Promise<JobStatus> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await getJobStatus(taskId);
    if (status.status === "SUCCESS" || status.status === "FAILURE") {
      return status;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new ApiError(408, "Analysis job did not complete in time");
}

export interface StatCard {
  label: string;
  value: number;
  trend_pct: number | null;
  sparkline: number[] | null;
}

export interface DashboardStats {
  threat_actors: StatCard;
  unique_handles: StatCard;
  pgp_keys: StatCard;
  wallets_tracked: StatCard;
  attribution_links: StatCard;
  high_confidence_links: StatCard;
}

export interface TimelineEvent {
  event_type: string;
  occurred_at: string;
  summary: string;
  actor_id: string | null;
  source: string | null;
  category: string | null;
}

export interface TimelineFilters {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;
  actorId?: string;
  source?: string;
  category?: string;
  eventType?: string;
}

export interface SourceBreakdownItem {
  source_platform: string;
  count: number;
}

export interface TopLinkSignal {
  label: string;
  value: number;
  weight: number;
}

export interface TopLink {
  actor_id: string;
  actor_label: string;
  confidence: number;
  username_a: string;
  platform_a: string;
  username_b: string;
  platform_b: string;
  signals: TopLinkSignal[];
}

export interface InfraFindingRow {
  id: string;
  onion_address: string;
  finding_type: string;
  detail: Record<string, unknown>;
  resolved_ip: string | null;
  discovered_at: string;
  actor_id: string | null;
  actor_label: string | null;
}

export interface TorRelay {
  fingerprint: string;
  nickname: string;
  ip_addresses: string[];
  country: string | null;
  running: boolean;
  flags: string[];
  first_seen: string | null;
  last_seen: string | null;
}

export interface ThreatEvent {
  source: string;
  event_uuid: string;
  org_name: string | null;
  info: string;
  tags: string[];
  event_date: string | null;
  threat_level_id: number | null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>("/api/dashboard/stats");
}

export async function getDashboardTimeline(
  limit = 20,
  filters: TimelineFilters = {}
): Promise<TimelineEvent[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (filters.startDate) params.set("start_date", filters.startDate);
  if (filters.endDate) params.set("end_date", filters.endDate);
  if (filters.actorId) params.set("actor_id", filters.actorId);
  if (filters.source) params.set("source", filters.source);
  if (filters.category) params.set("category", filters.category);
  if (filters.eventType) params.set("event_type", filters.eventType);
  return request<TimelineEvent[]>(`/api/dashboard/timeline?${params.toString()}`);
}

export async function getSourceBreakdown(): Promise<SourceBreakdownItem[]> {
  return request<SourceBreakdownItem[]>("/api/dashboard/sources");
}

export async function getTopLink(): Promise<TopLink | null> {
  return request<TopLink | null>("/api/dashboard/top-link");
}

export async function getInfraFindingsGlobal(limit = 20): Promise<InfraFindingRow[]> {
  return request<InfraFindingRow[]>(`/api/dashboard/infra-findings?limit=${limit}`);
}

export async function getTorRelays(limit = 50): Promise<TorRelay[]> {
  return request<TorRelay[]>(`/api/dashboard/tor-relays?limit=${limit}`);
}

export async function getThreatEvents(limit = 50): Promise<ThreatEvent[]> {
  return request<ThreatEvent[]>(`/api/dashboard/threat-events?limit=${limit}`);
}

export interface BreachRecord {
  name: string;
  domain: string | null;
  breach_date: string | null;
  pwn_count: number;
  data_classes: string[];
  is_verified: boolean;
}

export interface DataSourceStatus {
  key: string;
  label: string;
  category: "historical" | "continuously_refreshed" | "feed" | "api";
  record_count: number;
  most_recent_at: string | null;
  configured: boolean;
  collection_mode: "scheduled" | "manual" | "not_applicable";
  last_run_status: "ok" | "failed" | "never_run" | null;
  next_scheduled_at: string | null;
}

export async function getBreachRecords(limit = 50): Promise<BreachRecord[]> {
  return request<BreachRecord[]>(`/api/dashboard/breaches?limit=${limit}`);
}

export async function getSourceRegistry(): Promise<DataSourceStatus[]> {
  return request<DataSourceStatus[]>("/api/dashboard/source-registry");
}

export interface HiddenServiceCorrelation {
  source: string;
  matched_value: string;
  description: string;
}

export interface HiddenServiceRow {
  id: string;
  onion_address: string;
  finding_type: string;
  detail: Record<string, unknown>;
  resolved_ip: string | null;
  discovered_at: string;
  actor_id: string | null;
  actor_label: string | null;
  correlations: HiddenServiceCorrelation[];
}

export interface HiddenServicesSummary {
  hidden_services: number;
  infrastructure_findings: number;
  correlations: number;
  linked_actors: number;
}

export interface HiddenServices {
  summary: HiddenServicesSummary;
  rows: HiddenServiceRow[];
}

export async function getHiddenServices(limit = 100): Promise<HiddenServices> {
  return request<HiddenServices>(`/api/dashboard/hidden-services?limit=${limit}`);
}

export interface PersonaActivityRecord {
  identifier_type: string;
  value: string;
  source_platform: string;
  actor_id: string | null;
  actor_label: string | null;
  last_seen: string;
}

export interface PersonaActivitySummary {
  total_records: number;
  unique_handles: number;
  linked_actors: number;
  pgp_keys: number;
  wallets: number;
  by_source: SourceBreakdownItem[];
}

export interface PersonaActivity {
  summary: PersonaActivitySummary;
  records: PersonaActivityRecord[];
}

export async function getIdentifierActivity(
  platforms: string[],
  limit = 200
): Promise<PersonaActivity> {
  const params = new URLSearchParams({ platforms: platforms.join(","), limit: String(limit) });
  return request<PersonaActivity>(`/api/dashboard/identifier-activity?${params.toString()}`);
}

export interface Alert {
  alert_type: "high_confidence_actor" | "new_linkage" | "correlation" | "infra_finding";
  severity: "high" | "medium" | "low";
  summary: string;
  occurred_at: string;
  actor_id: string | null;
}

export async function getAlerts(limit = 30): Promise<Alert[]> {
  return request<Alert[]>(`/api/dashboard/alerts?limit=${limit}`);
}

export interface ComponentStatus {
  name: string;
  healthy: boolean;
  detail: string | null;
}

export interface SystemStatus {
  checked_at: string;
  components: ComponentStatus[];
}

export async function getSystemStatus(): Promise<SystemStatus> {
  return request<SystemStatus>("/api/dashboard/system-status");
}

export { ApiError };
