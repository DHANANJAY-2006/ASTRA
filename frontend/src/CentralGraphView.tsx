import { useEffect, useState, useRef, useMemo } from "react";
import { computeLayout, LayoutEdge } from "./forceLayout";
import { NetworkIcon, UserIcon, WalletIcon, KeyIcon, ServerIcon, ActivityIcon } from "./icons";

interface GraphNode {
  id: string;
  label: string;
  type: "actor" | "handle" | "wallet" | "onion" | "ip" | "pgp" | "breach" | "cert" | "evidence_anchor" | string;
  details: Record<string, any>;
}

interface GraphEdgeData {
  source: string;
  target: string;
  label: string;
  type: string;
  weight: number;
}

interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdgeData[];
  total_nodes: number;
  total_edges: number;
}

const TYPE_COLORS: Record<string, string> = {
  actor: "#eab308", // gold
  handle: "#3b82f6", // blue
  wallet: "#a855f7", // purple
  onion: "#f97316", // orange
  ip: "#ef4444", // red (leaked clearnet IP)
  pgp: "#10b981", // green
  breach: "#ec4899", // magenta
  evidence_anchor: "#14b8a6", // teal
  default: "#94a3b8"
};

export default function CentralGraphView({ onSelectActor }: { onSelectActor?: (actorId: string) => void }) {
  const [data, setData] = useState<GraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/graph")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: GraphResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredNodes = useMemo(() => {
    if (!data) return [];
    return data.nodes.filter((n) => {
      const matchType = filterType === "all" || n.type === filterType;
      const matchSearch =
        !searchQuery ||
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [data, filterType, searchQuery]);

  const visibleNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    if (!data) return [];
    return data.edges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));
  }, [data, visibleNodeIds]);

  const positions = useMemo(() => {
    if (filteredNodes.length === 0) return new Map();
    const nodeIds = filteredNodes.map((n) => n.id);
    const layoutEdges: LayoutEdge[] = filteredEdges.map((e) => ({ source: e.source, target: e.target }));
    return computeLayout(nodeIds, layoutEdges, 900, 600, 320);
  }, [filteredNodes, filteredEdges]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div className="section-card" style={{ padding: "4rem", textAlign: "center" }}>
        <div style={{ color: "var(--accent)", fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          Synthesizing Force-Directed De-Anonymization Topology...
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Evaluating multi-modal correlation edges and Section 65B hash anchors
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="section-card" style={{ padding: "2rem", borderLeft: "4px solid var(--danger)" }}>
        <h3 style={{ color: "var(--danger)", margin: "0 0 0.5rem 0" }}>Graph Synthesis Error</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{error || "Could not load graph data from ASTRA API"}</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="section-card" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.35rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <NetworkIcon width={20} height={20} />
              Central Investigation Network Canvas
            </h2>
            <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-muted)", fontSize: "0.86rem" }}>
              Force-directed multi-signal topology mapping darknet personas, UTXO wallet clusters, Tor infrastructure, and Section 65B court evidence
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <strong>{filteredNodes.length}</strong> nodes | <strong>{filteredEdges.length}</strong> edges
            </span>
            <button className="btn-secondary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.85rem" }} onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}>
              + Zoom
            </button>
            <button className="btn-secondary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.85rem" }} onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}>
              - Zoom
            </button>
            <button className="btn-secondary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.85rem" }} onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
              Reset
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search nodes (e.g. vektor_ops, bc1q, IP)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: "1 1 240px",
              padding: "0.4rem 0.75rem",
              background: "var(--bg-input, rgba(255,255,255,0.05))",
              border: "1px solid var(--border-color, rgba(255,255,255,0.15))",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "0.88rem"
            }}
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: "0.4rem 0.75rem",
              background: "var(--bg-input, rgba(255,255,255,0.05))",
              border: "1px solid var(--border-color, rgba(255,255,255,0.15))",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "0.88rem"
            }}
          >
            <option value="all">All Entity Types</option>
            <option value="actor">Attributed Threat Actors</option>
            <option value="handle">Forum & Market Handles</option>
            <option value="wallet">Bitcoin & UTXO Wallets</option>
            <option value="onion">Tor Hidden Services</option>
            <option value="ip">Leaked Clearnet IPs</option>
            <option value="pgp">PGP Public Keys</option>
            <option value="breach">Breach & Domain OSINT</option>
            <option value="evidence_anchor">Section 65B Hash Anchors</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedNode ? "1fr 320px" : "1fr", gap: "1rem" }}>
        <div
          className="section-card"
          style={{
            height: "640px",
            position: "relative",
            overflow: "hidden",
            cursor: isDragging ? "grabbing" : "grab",
            background: "radial-gradient(circle at center, #111827 0%, #030712 100%)",
            border: "1px solid rgba(255,255,255,0.1)"
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <svg width="100%" height="100%">
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {filteredEdges.map((edge, idx) => {
                const src = positions.get(edge.source);
                const tgt = positions.get(edge.target);
                if (!src || !tgt) return null;
                const isHighlight =
                  selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target);

                return (
                  <g key={`edge_${idx}`}>
                    <line
                      x1={src.x}
                      y1={src.y}
                      x2={tgt.x}
                      y2={tgt.y}
                      stroke={isHighlight ? "var(--accent)" : "rgba(148, 163, 184, 0.25)"}
                      strokeWidth={isHighlight ? 2.5 : 1.2}
                      strokeDasharray={edge.type === "REAL_WORLD_LINK" ? "4 4" : "none"}
                    />
                  </g>
                );
              })}

              {filteredNodes.map((node) => {
                const pos = positions.get(node.id);
                if (!pos) return null;
                const isSelected = selectedNode?.id === node.id;
                const color = TYPE_COLORS[node.type] || TYPE_COLORS.default;
                const isActor = node.type === "actor";

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node);
                    }}
                  >
                    <circle
                      r={isActor ? 16 : 10}
                      fill={color}
                      stroke={isSelected ? "#ffffff" : "rgba(0,0,0,0.4)"}
                      strokeWidth={isSelected ? 3 : 1.5}
                      style={{
                        filter: isSelected ? "drop-shadow(0 0 8px rgba(255,255,255,0.8))" : "none",
                        transition: "r 0.15s ease"
                      }}
                    />
                    <text
                      dy={isActor ? 26 : 18}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize={isActor ? "11px" : "9px"}
                      fontWeight={isActor ? 700 : 500}
                      style={{ pointerEvents: "none", textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
                    >
                      {node.label.length > 20 ? node.label.slice(0, 18) + "..." : node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          <div
            style={{
              position: "absolute",
              bottom: "1rem",
              left: "1rem",
              background: "rgba(15, 23, 42, 0.85)",
              backdropFilter: "blur(6px)",
              padding: "0.6rem 0.9rem",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              gap: "0.9rem",
              flexWrap: "wrap",
              fontSize: "0.78rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: TYPE_COLORS.actor }}></span>
              <span>Attributed Actor</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: TYPE_COLORS.handle }}></span>
              <span>Handle</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: TYPE_COLORS.wallet }}></span>
              <span>Wallet</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: TYPE_COLORS.onion }}></span>
              <span>Tor Service</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: TYPE_COLORS.ip }}></span>
              <span>Leaked IP</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: TYPE_COLORS.pgp }}></span>
              <span>PGP Key</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: TYPE_COLORS.evidence_anchor }}></span>
              <span>Sec 65B Anchor</span>
            </div>
          </div>
        </div>

        {selectedNode && (
          <div className="section-card" style={{ padding: "1.25rem", overflowY: "auto", maxHeight: "640px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                    background: `${TYPE_COLORS[selectedNode.type] || "#94a3b8"}22`,
                    color: TYPE_COLORS[selectedNode.type] || "#94a3b8",
                    border: `1px solid ${TYPE_COLORS[selectedNode.type] || "#94a3b8"}44`
                  }}
                >
                  {selectedNode.type.replace("_", " ")}
                </span>
                <h3 style={{ margin: "0.4rem 0 0 0", fontSize: "1.1rem", wordBreak: "break-all" }}>{selectedNode.label}</h3>
              </div>
              <button
                className="btn-ghost"
                style={{ padding: "0.2rem 0.4rem", fontSize: "0.9rem" }}
                onClick={() => setSelectedNode(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
              <div>
                <strong style={{ color: "var(--text-muted)", display: "block", marginBottom: "0.2rem" }}>Node Identifier</strong>
                <code style={{ wordBreak: "break-all", fontSize: "0.78rem" }}>{selectedNode.id}</code>
              </div>

              {selectedNode.details.dacs_score !== undefined && (
                <div>
                  <strong style={{ color: "var(--text-muted)", display: "block", marginBottom: "0.2rem" }}>DACS Confidence Score</strong>
                  <span style={{ color: "var(--success)", fontWeight: 700, fontSize: "1.1rem" }}>
                    {selectedNode.details.dacs_score}%
                  </span>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{selectedNode.details.verdict}</div>
                </div>
              )}

              {selectedNode.details.explanation && (
                <div>
                  <strong style={{ color: "var(--text-muted)", display: "block", marginBottom: "0.2rem" }}>Forensic Correlation</strong>
                  <p style={{ margin: 0, color: "var(--text-normal)" }}>{selectedNode.details.explanation}</p>
                </div>
              )}

              {selectedNode.details.hash && (
                <div>
                  <strong style={{ color: "var(--text-muted)", display: "block", marginBottom: "0.2rem" }}>Section 65B Hash</strong>
                  <code style={{ wordBreak: "break-all", fontSize: "0.75rem", color: "var(--accent)" }}>
                    {selectedNode.details.hash}
                  </code>
                </div>
              )}

              {selectedNode.type === "actor" && onSelectActor && (
                <button
                  className="btn-primary"
                  style={{ marginTop: "1rem", width: "100%", padding: "0.5rem" }}
                  onClick={() => onSelectActor(selectedNode.id.replace("actor_", ""))}
                >
                  View Full Actor Profile
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
