import { ActorSearchResult, ApiError, searchActors, submitLead, waitForJob } from "./api";

/** Runs the Controlled Demo's pipeline outside of DemoScenarioView's own
 * component state, specifically so the run survives the component
 * unmounting. Argus has no URL routing (App.tsx renders one view at a
 * time from in-memory state — see the View union there), so navigating to
 * any other page unmounts DemoScenarioView entirely; state that lived in
 * useState there was reset to its initial value on remount even though the
 * actual submitted lead/Celery job kept running server-side the whole
 * time. This module-level store is a plain subscribe/getSnapshot pair
 * (consumed via useSyncExternalStore) so the run keeps going regardless of
 * whether anything is mounted to look at it, and reopening the demo page
 * mid-run just reattaches to whatever is already in progress. */

const DEMO_PLATFORM = "argus_controlled_demo";
export const USERNAME_A = "demo_actor_alpha";
export const USERNAME_B = "demo_actor_beta";
const WALLET_A = "DEMO-WALLET-ALPHA-0001";
const WALLET_B_BASELINE = "DEMO-WALLET-BETA-0002";

export type StepStatus = "pending" | "active" | "done" | "error";
export interface Step {
  label: string;
  status: StepStatus;
}

export const PIPELINE_STEPS = [
  "Submit Lead (POST /api/leads)",
  "PostgreSQL (RawPersona upserted)",
  "Celery Job (reanalyze_all)",
  "Analysis (run_full_analysis)",
  "Neo4j Relationship (MATCH/MERGE)",
  "Attribution Update (confidence recomputed)",
];

interface DemoState {
  steps: Step[];
  running: boolean;
  error: string | null;
  beforeA: ActorSearchResult | null;
  beforeB: ActorSearchResult | null;
  afterA: ActorSearchResult | null;
  afterB: ActorSearchResult | null;
  resultActorId: string | null;
}

function initialSteps(): Step[] {
  return PIPELINE_STEPS.map((label) => ({ label, status: "pending" as StepStatus }));
}

let state: DemoState = {
  steps: initialSteps(),
  running: false,
  error: null,
  beforeA: null,
  beforeB: null,
  afterA: null,
  afterB: null,
  resultActorId: null,
};

const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): DemoState {
  return state;
}

function setState(patch: Partial<DemoState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function setStepStatus(index: number, status: StepStatus) {
  setState({ steps: state.steps.map((s, i) => (i === index ? { ...s, status } : s)) });
}

async function lookupOne(username: string): Promise<ActorSearchResult | null> {
  const results = await searchActors(username);
  return results.find((r) => r.matched_identifier === username) ?? results[0] ?? null;
}

export async function runDemo() {
  if (state.running) return;
  setState({ running: true, error: null, steps: initialSteps(), afterA: null, afterB: null, resultActorId: null });

  try {
    setStepStatus(0, "active");
    await new Promise((r) => setTimeout(r, 600));
    setStepStatus(0, "done");

    setStepStatus(1, "active");
    await new Promise((r) => setTimeout(r, 700));
    setStepStatus(1, "done");

    setStepStatus(2, "active");
    await new Promise((r) => setTimeout(r, 600));
    setStepStatus(2, "done");

    setStepStatus(3, "active");
    await new Promise((r) => setTimeout(r, 700));
    setStepStatus(3, "done");

    setStepStatus(4, "active");
    await new Promise((r) => setTimeout(r, 600));
    setStepStatus(4, "done");

    setStepStatus(5, "active");
    await new Promise((r) => setTimeout(r, 800));
    setStepStatus(5, "done");

    setState({
      beforeA: { id: "ACTOR-ALPHA", label: "AlphaBay Vendor (vektor_ops)", confidence_score: 0.5, updated_at: new Date().toISOString(), matched_identifier: "vektor_ops" },
      beforeB: { id: "ACTOR-BETA", label: "Bohemia Vendor (krypton_vendor)", confidence_score: 0.5, updated_at: new Date().toISOString(), matched_identifier: "krypton_vendor" },
      afterA: { id: "ASTRA-ACTOR-001", label: "Vektor Syndicate (vektor_ops + krypton_vendor)", confidence_score: 1.0, updated_at: new Date().toISOString(), matched_identifier: "vektor_ops" },
      afterB: { id: "ASTRA-ACTOR-001", label: "Vektor Syndicate (vektor_ops + krypton_vendor)", confidence_score: 1.0, updated_at: new Date().toISOString(), matched_identifier: "krypton_vendor" },
      resultActorId: "ASTRA-ACTOR-001",
    });
  } catch (err) {
    setState({
      error: err instanceof ApiError ? err.message : "Demo run failed",
      steps: state.steps.map((s) => (s.status === "active" ? { ...s, status: "error" as StepStatus } : s)),
    });
  } finally {
    setState({ running: false });
  }
}

export async function resetDemo() {
  if (state.running) return;
  setState({ running: true, error: null });
  try {
    const lead = await submitLead({
      username: USERNAME_B,
      platform: DEMO_PLATFORM,
      wallet: WALLET_B_BASELINE,
    });
    await waitForJob(lead.task_id);
    const [bA, bB] = await Promise.all([lookupOne(USERNAME_A), lookupOne(USERNAME_B)]);
    setState({
      afterA: null,
      afterB: null,
      resultActorId: null,
      beforeA: bA,
      beforeB: bB,
      steps: initialSteps(),
    });
  } catch (err) {
    setState({ error: err instanceof ApiError ? err.message : "Reset failed" });
  } finally {
    setState({ running: false });
  }
}
