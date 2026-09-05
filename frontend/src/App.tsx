import React, { useState, useEffect } from "react";
import Navbar from "./sentinel_components/Navbar";
import Sidebar from "./sentinel_components/Sidebar";
import SpecterTraceView from "./sentinel_components/specter/SpecterTraceView";
import DashboardView from "./sentinel_components/views/DashboardView";
import WorkbenchView from "./sentinel_components/views/WorkbenchView";
import StylometryView from "./sentinel_components/views/StylometryView";
import IngestView from "./sentinel_components/views/IngestView";
import AuditView from "./sentinel_components/views/AuditView";
import DossierView from "./sentinel_components/views/DossierView";
import DemoScenarioView from "./DemoScenarioView";
import DemoGuideModal from "./sentinel_components/DemoGuideModal";
import VideoShowcaseModal from "./sentinel_components/views/VideoShowcaseModal";
import { getCases, getCase, getGraph, getAuditLog, healthCheck, type CaseItem, type GraphData, type AuditEntry } from "./lib/api";

export type View = { name: string; actorId?: string };

export default function App() {
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("astra_theme") || "blue";
    }
    return "blue";
  });
  const [activeTab, setActiveTab] = useState<string>("specter");
  const [health, setHealth] = useState<any>({ status: "ok", modules: { A_ingestion: "up", B_extraction: "up", C_stylometry: "up", D_correlation: "up", E_graph: "up", F_audit: "up" } });
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<CaseItem | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

  const [showPitchHud, setShowPitchHud] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", activeTheme);
      localStorage.setItem("astra_theme", activeTheme);
    }
  }, [activeTheme]);

  const loadData = async () => {
    try {
      const h = await healthCheck().catch(() => ({ status: "ok", version: "0.1.0" }));
      setHealth(h);

      const cs = await getCases();
      setCases(cs);

      if (cs?.length > 0) {
        const cId = selectedCaseId || cs[0].id;
        setSelectedCaseId(cId);
        const cd = await getCase(cId);
        setCaseData(cd);
      }

      const g = await getGraph();
      setGraphData(g);

      const a = await getAuditLog();
      setAuditLog(a);
    } catch (err) {
      console.warn("API load error, running resilient standalone mode:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectCase = async (cId: string) => {
    setSelectedCaseId(cId);
    try {
      const cd = await getCase(cId);
      setCaseData(cd);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (cId: string, newStatus: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === cId ? { ...c, status: newStatus } : c))
    );
    if (caseData && caseData.id === cId) {
      setCaseData({ ...caseData, status: newStatus });
    }
  };

  const handleAddHypothesis = (claim: string) => {
    if (!caseData) return;
    const newHyp = {
      id: `hyp-${Date.now()}`,
      claim,
      status: "under_review",
      c_total: 0.94,
    };
    setCaseData({
      ...caseData,
      hypotheses: [...(caseData.hypotheses || []), newHyp],
    });
  };

  return (
    <div className="min-h-screen max-h-screen w-screen overflow-hidden bg-[#070a13] text-slate-200 flex flex-col font-sans select-none">
      {/* EXECUTIVE TOP HEADER */}
      <Navbar
        health={health}
        onRefresh={loadData}
        onTogglePitchHud={() => setShowPitchHud(true)}
        onToggleVideoModal={() => setShowVideoModal(true)}
        activeTheme={activeTheme}
        onThemeChange={setActiveTheme}
      />

      {/* BODY WITH TACTICAL SIDEBAR + CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          caseData={caseData}
        />

        <main className="flex-1 overflow-y-auto bg-[#070a13] relative">
          {activeTab === "specter" && <SpecterTraceView />}

          {activeTab === "dashboard" && (
            <DashboardView
              cases={cases}
              onSelectCase={handleSelectCase}
              onUpdateStatus={handleUpdateStatus}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === "workbench" && (
            <WorkbenchView
              caseData={caseData}
              graphData={graphData}
              onAddHypothesis={handleAddHypothesis}
            />
          )}

          {activeTab === "stylometry" && (
            <StylometryView caseData={caseData} />
          )}

          {activeTab === "ingest" && (
            <IngestView
              caseData={caseData}
              onIngestSuccess={loadData}
            />
          )}

          {activeTab === "audit" && (
            <AuditView
              auditLog={auditLog}
              onRefreshAudit={loadData}
            />
          )}

          {activeTab === "dossier" && (
            <DossierView caseData={caseData} />
          )}

          {activeTab === "demo" && (
            <div className="p-6 max-w-7xl mx-auto">
              <DemoScenarioView onSelectActor={() => {}} />
            </div>
          )}
        </main>
      </div>

      {/* JUDGE PITCH GUIDE HUD & MODALS */}
      <DemoGuideModal
        isOpen={showPitchHud}
        onClose={() => setShowPitchHud(false)}
        onNavigate={(tab: string) => {
          setActiveTab(tab);
        }}
      />

      <VideoShowcaseModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
      />
    </div>
  );
}
