import React, { useState, useEffect } from "react";
import {
  Radio,
  Lock,
  UserCheck,
  Clock,
  RefreshCw,
  Film,
  Sparkles,
  Palette,
} from "lucide-react";

export default function Navbar({
  activeRole,
  setActiveRole,
  health,
  onRefresh,
  onTogglePitchHud,
  onToggleVideoModal,
  activeTheme = "blue",
  onThemeChange,
}) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const ROLES = [
    { id: "analyst_demo", name: "Priya", title: "Senior Analyst", role: "analyst" },
    { id: "forensic_demo", name: "Rakesh", title: "Forensic Investigator", role: "investigator" },
    { id: "soc_lead_demo", name: "Anjali", title: "SOC Lead", role: "soc_lead" },
    { id: "auditor_demo", name: "Auditor", title: "Compliance Officer", role: "auditor" },
  ];

  const THEMES = [
    { id: "blue", label: "Blue", color: "#00f0ff", bg: "bg-cyan-500" },
    { id: "green", label: "Green", color: "#00ff9d", bg: "bg-emerald-400" },
    { id: "red", label: "Red", color: "#ff0055", bg: "bg-rose-500" },
  ];

  return (
    <header className="border-b border-theme-accent bg-[#080c16]/95 backdrop-blur sticky top-0 z-50 px-4 py-2 flex items-center justify-between shadow-lg">
      {/* Brand & Circular Logo */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-theme-accent shadow-theme-glow flex items-center justify-center shrink-0 bg-white p-0.5">
            <img
              src="/logo.png"
              alt="ASTRA Logo"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-base tracking-wider text-slate-100 uppercase font-mono">
                PROJECT <span className="text-theme-accent">ASTRA</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/60 font-semibold tracking-wide">
                RESTRICTED // NTRO
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
              <span className="text-theme-accent font-bold">SIH26151</span>
              <span>•</span>
              <span className="text-slate-300 font-sans">Dark Web Threat De-Anonymization Platform</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tor & OPSEC Security Status Bar */}
      <div className="hidden xl:flex items-center space-x-3 px-3 py-1 rounded bg-[#0b1324] border border-slate-800 text-xs font-mono">
        <div className="flex items-center space-x-1.5">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${health ? 'bg-emerald-400 opacity-75' : 'bg-red-400 opacity-75'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${health ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          </span>
          <span className="text-slate-300">Backend:</span>
          <span className={health ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
            {health ? "ONLINE (6/6 Modules)" : "OFFLINE"}
          </span>
        </div>

        <span className="text-slate-600">|</span>

        <div className="flex items-center space-x-1.5 text-slate-300">
          <Radio className="w-3.5 h-3.5 text-theme-accent animate-pulse" />
          <span>Tor Circuit:</span>
          <span className="text-theme-accent font-semibold">Isolated SOCKS5</span>
        </div>

        <span className="text-slate-600">|</span>

        <div className="flex items-center space-x-1 text-slate-300">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Privoxy:</span>
          <span className="text-emerald-400">Scrubbing OK</span>
        </div>
      </div>

      {/* Right Controls: Theme Switcher, Role, Clock & Action Buttons */}
      <div className="flex items-center space-x-2.5">
        {/* DYNAMIC TRI-COLOR THEME SWITCHER */}
        <div className="flex items-center space-x-1.5 bg-[#0b1220] border border-slate-800 rounded-lg px-2 py-1">
          <Palette className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline uppercase">Theme:</span>
          <div className="flex items-center space-x-1">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => onThemeChange && onThemeChange(t.id)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition flex items-center space-x-1 ${
                  activeTheme === t.id
                    ? "bg-slate-800 border text-slate-100 shadow-md"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
                style={{
                  borderColor: activeTheme === t.id ? t.color : "transparent",
                  color: activeTheme === t.id ? t.color : undefined,
                }}
                title={`Switch to ${t.label} Theme`}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: t.color }}
                ></span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Role Selector */}
        <div className="flex items-center space-x-1.5 bg-[#0e172a] border border-slate-800 rounded px-2 py-1 text-xs">
          <UserCheck className="w-3.5 h-3.5 text-theme-accent" />
          <span className="text-slate-400 text-[11px] hidden md:inline">Role:</span>
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value)}
            className="bg-transparent text-theme-accent font-mono text-xs focus:outline-none cursor-pointer"
          >
            {ROLES.map((r) => (
              <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                {r.name} ({r.title})
              </option>
            ))}
          </select>
        </div>

        {/* Live Clock */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-[#0b1220] border border-slate-800/80 rounded px-2 py-1 text-slate-300 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{time}</span>
        </div>

        {/* Action Buttons */}
        {onTogglePitchHud && (
          <button
            onClick={onTogglePitchHud}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs font-mono transition shadow-[0_0_10px_rgba(245,158,11,0.3)]"
            title="Open 5-Minute Live Pitch Prompter & Timer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pitch HUD</span>
          </button>
        )}

        {onToggleVideoModal && (
          <button
            onClick={onToggleVideoModal}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-theme-accent border border-theme-accent font-bold text-xs font-mono transition"
            title="Open Video Architecture Showcase"
          >
            <Film className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Video Demo</span>
          </button>
        )}

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh Intelligence Data"
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-theme-accent border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
}
