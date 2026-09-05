import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { isLoggedIn, logout } from "./api";
import LoginView from "./LoginView";
import NotFoundView from "./NotFoundView";
import DashboardView from "./DashboardView";
import Sidebar from "./Sidebar";
import { EyeIcon, LoaderIcon, LogOutIcon, PlusIcon } from "./icons";

// Dashboard loads eagerly (it's the screen every session lands on right
// after login); every other view is only ever needed once a user clicks
// into it, so they're code-split into their own chunks rather than
// bundled into the initial JS payload.
const SearchView = lazy(() => import("./SearchView"));
const ActorProfileView = lazy(() => import("./ActorProfileView"));
const SubmitLeadView = lazy(() => import("./SubmitLeadView"));
const InfrastructureView = lazy(() => import("./InfrastructureView"));
const IndicatorsView = lazy(() => import("./IndicatorsView"));
const TimelineView = lazy(() => import("./TimelineView"));
const AttributionView = lazy(() => import("./AttributionView"));
const SourcesView = lazy(() => import("./SourcesView"));
const DemoScenarioView = lazy(() => import("./DemoScenarioView"));
const HiddenServicesView = lazy(() => import("./HiddenServicesView"));
const MarketplacesView = lazy(() => import("./MarketplacesView"));
const ForumsView = lazy(() => import("./ForumsView"));
const AlertsView = lazy(() => import("./AlertsView"));
const ReportsView = lazy(() => import("./ReportsView"));
const JobsScansView = lazy(() => import("./JobsScansView"));
const CentralGraphView = lazy(() => import("./CentralGraphView"));

export type View =
  | { name: "dashboard" }
  | { name: "graph" }
  | { name: "search" }
  | { name: "profile"; actorId: string }
  | { name: "submit" }
  | { name: "infrastructure" }
  | { name: "attribution" }
  | { name: "timeline" }
  | { name: "indicators" }
  | { name: "sources" }
  | { name: "demo" }
  | { name: "hidden-services" }
  | { name: "marketplaces" }
  | { name: "forums" }
  | { name: "alerts" }
  | { name: "reports" }
  | { name: "jobs" };

export default function App() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [view, setView] = useState<View>({ name: "dashboard" });
  const [invalidPath] = useState<string | null>(() => {
    const p = window.location.pathname;
    return p === "/" ? null : p;
  });
  const isPoppingRef = useRef(false);

  useEffect(() => {
    window.history.replaceState({ view: { name: "dashboard" } as View }, "");
    function onPopState(event: PopStateEvent) {
      isPoppingRef.current = true;
      setView((event.state?.view as View | undefined) ?? { name: "dashboard" });
      isPoppingRef.current = false;
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(next: View) {
    setView(next);
    if (!isPoppingRef.current) {
      window.history.pushState({ view: next }, "");
    }
  }

  if (invalidPath) {
    return <NotFoundView path={invalidPath} />;
  }

  if (!loggedIn) {
    return <LoginView onLoggedIn={() => setLoggedIn(true)} />;
  }

  function handleLogout() {
    logout();
    setLoggedIn(false);
    setView({ name: "dashboard" });
    window.history.replaceState({ view: { name: "dashboard" } as View }, "");
  }

  function selectActor(actorId: string) {
    navigate({ name: "profile", actorId });
  }

  function handleNav(name: View["name"]) {
    navigate({ name } as View);
  }

  return (
    <div className="app-shell app-shell-sidebar">
      <header>
        <div className="brand">
          <div className="brand-mark">
            <EyeIcon width={18} height={18} />
          </div>
          <div className="brand-text">
            <h1>PROJECT ASTRA</h1>
            <span>Autonomous Threat De-Anonymization | Team BISHOP (SIH 2026)</span>
          </div>
        </div>
        <div className="actions">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(16, 185, 129, 0.12)",
              color: "#34d399",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              padding: "0.25rem 0.65rem",
              borderRadius: "999px",
              fontSize: "0.78rem",
              fontWeight: 600,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981" }}></span>
            Sec 65B / BSA 2023 Cryptographic Hash Active
          </div>
          {view.name !== "submit" && (
            <button className="btn-secondary" onClick={() => navigate({ name: "submit" })}>
              <PlusIcon width={16} height={16} />
              Submit lead
            </button>
          )}
          <button className="btn-ghost" onClick={handleLogout}>
            <LogOutIcon width={16} height={16} />
            Reset Session
          </button>
        </div>
      </header>

      <div className="app-body">
        <Sidebar active={view.name} onSelect={handleNav} />
        <main>
          <Suspense
            fallback={
              <div className="centered" style={{ minHeight: "auto", padding: "4rem 0" }}>
                <LoaderIcon width={20} height={20} />
              </div>
            }
          >
          {view.name === "dashboard" && <DashboardView onSelectActor={selectActor} />}
          {view.name === "graph" && <CentralGraphView onSelectActor={selectActor} />}
          {view.name === "search" && <SearchView onSelectActor={selectActor} />}
          {view.name === "profile" && (
            <ActorProfileView actorId={view.actorId} onBack={() => navigate({ name: "search" })} />
          )}
          {view.name === "submit" && <SubmitLeadView onDone={() => navigate({ name: "search" })} />}
          {view.name === "infrastructure" && <InfrastructureView />}
          {view.name === "attribution" && <AttributionView onSelectActor={selectActor} />}
          {view.name === "timeline" && <TimelineView onSelectActor={selectActor} />}
          {view.name === "indicators" && <IndicatorsView />}
          {view.name === "sources" && <SourcesView />}
          {view.name === "demo" && <DemoScenarioView onSelectActor={selectActor} />}
          {view.name === "hidden-services" && <HiddenServicesView onSelectActor={selectActor} />}
          {view.name === "marketplaces" && <MarketplacesView onSelectActor={selectActor} />}
          {view.name === "forums" && <ForumsView onSelectActor={selectActor} />}
          {view.name === "alerts" && <AlertsView onSelectActor={selectActor} />}
          {view.name === "reports" && <ReportsView onSelectActor={selectActor} />}
          {view.name === "jobs" && <JobsScansView />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
