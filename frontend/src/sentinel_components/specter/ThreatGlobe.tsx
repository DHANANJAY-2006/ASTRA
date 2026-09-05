import React, { useEffect, useRef, useState } from "react";
import { ActorData } from "../../lib/threatData";
import { RotateCw, Compass, Globe2 } from "lucide-react";

interface ThreatGlobeProps {
  actor: ActorData;
}

export default function ThreatGlobe({ actor }: ThreatGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let angle = rotation;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.38;

      ctx.clearRect(0, 0, width, height);

      // Deep cyber space background
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.4);
      grad.addColorStop(0, "rgba(6, 182, 212, 0.12)");
      grad.addColorStop(0.6, "rgba(8, 14, 28, 0.95)");
      grad.addColorStop(1, "rgba(7, 10, 19, 1)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Outer glow atmosphere
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sphere base
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#091122";
      ctx.fill();

      // Latitudinal grid rings
      for (let lat = -60; lat <= 60; lat += 30) {
        const y = cy + (lat / 90) * radius;
        const rLat = radius * Math.cos((lat * Math.PI) / 180);
        ctx.beginPath();
        ctx.ellipse(cx, y, rLat, rLat * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 240, 255, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Longitudinal rotating meridian arcs
      for (let lon = 0; lon < 180; lon += 30) {
        const rad = ((lon + angle) * Math.PI) / 180;
        const w = radius * Math.sin(rad);
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(w), radius, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Nodes
      const nodes = [
        { label: "Tor Guard (Frankfurt)", lat: 50.11, lng: 8.68, color: "#00f0ff" },
        { label: "Tor Exit (Amsterdam)", lat: 52.36, lng: 4.9, color: "#00f0ff" },
        { label: `Origin: ${actor.location.city}`, lat: actor.location.lat, lng: actor.location.lng, color: "#ff0055" },
        { label: "Binance Off-Ramp", lat: -4.68, lng: 55.49, color: "#ffaa00" },
      ];

      const projectedNodes: { x: number; y: number; color: string; label: string; visible: boolean }[] = [];

      nodes.forEach((n) => {
        const phi = (n.lat * Math.PI) / 180;
        const theta = ((n.lng + angle) * Math.PI) / 180;
        const x = cx + radius * Math.cos(phi) * Math.sin(theta);
        const y = cy - radius * Math.sin(phi);
        const visible = Math.cos(theta) >= -0.2; // front-facing

        projectedNodes.push({ x, y, color: n.color, label: n.label, visible });

        if (visible) {
          // Node glow
          ctx.beginPath();
          ctx.arc(x, y, 7, 0, Math.PI * 2);
          ctx.fillStyle = n.color === "#ff0055" ? "rgba(255, 0, 85, 0.35)" : "rgba(0, 240, 255, 0.35)";
          ctx.fill();

          // Node center
          ctx.beginPath();
          ctx.arc(x, y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = n.color;
          ctx.fill();

          // Label
          ctx.font = "10px JetBrains Mono, monospace";
          ctx.fillStyle = "#e2e8f0";
          ctx.fillText(n.label, x + 8, y + 3);
        }
      });

      // Connect hops with curved arcs
      for (let i = 0; i < projectedNodes.length - 1; i++) {
        const p1 = projectedNodes[i];
        const p2 = projectedNodes[i + 1];
        if (p1.visible || p2.visible) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2 - 25;
          ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
          ctx.strokeStyle = i === 1 ? "rgba(255, 0, 85, 0.7)" : "rgba(0, 240, 255, 0.6)";
          ctx.lineWidth = 1.8;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      if (isAutoRotating) {
        angle = (angle + 0.45) % 360;
        setRotation(angle);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [actor, isAutoRotating]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[380px] bg-gradient-to-b from-[#070a13] via-[#090f1d] to-[#070a13] rounded-2xl overflow-hidden border border-cyan-500/20 shadow-cyber-glow flex flex-col justify-between select-none"
    >
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 text-xs font-mono pointer-events-auto shadow-md">
          <Globe2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span className="text-slate-200 font-bold tracking-wider">GEO-ATTRIBUTION RADAR</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
            ORIGIN: {actor.location.city.toUpperCase()} [{actor.location.utcOffset}]
          </span>
        </div>

        <div className="flex items-center space-x-1.5 pointer-events-auto">
          <button
            onClick={() => setRotation(0)}
            className="px-2.5 py-1 rounded bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-cyan-400 flex items-center space-x-1 transition"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Lock</span>
          </button>
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`p-1.5 rounded border text-[11px] font-mono transition ${
              isAutoRotating ? "bg-cyan-950/70 border-cyan-500 text-cyan-300" : "bg-slate-900 border-slate-700 text-slate-400"
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 w-full h-full flex items-center justify-center p-4">
        <canvas ref={canvasRef} width={600} height={360} className="w-full max-w-[650px] h-[340px]" />
      </div>

      <div className="px-4 py-2 bg-[#0b1322]/90 backdrop-blur-md border-t border-slate-800 text-[10px] font-mono flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-1 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]"></span>
            <span className="text-slate-300">Tor Circuit (Frankfurt → Amsterdam)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-1 rounded-full bg-[#ff0055] shadow-[0_0_8px_#ff0055]"></span>
            <span className="text-rose-300 font-bold">De-cloaked Origin ({actor.location.city} VPS)</span>
          </div>
          <div className="flex items-center space-x-1.5 hidden md:flex">
            <span className="w-2.5 h-1 rounded-full bg-[#ffaa00] shadow-[0_0_8px_#ffaa00]"></span>
            <span className="text-amber-300">Financial Cash-out (Binance Seychelles)</span>
          </div>
        </div>
        <div className="text-slate-400">
          Latency: <span className="text-emerald-400 font-bold">24ms</span> | Canvas 60FPS
        </div>
      </div>
    </div>
  );
}
