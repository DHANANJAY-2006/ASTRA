import React, { useState, useEffect } from "react";
import {
  Radio,
  Lock,
  ShieldCheck,
  Clock,
  RefreshCw,
  Film,
  Sparkles,
  Palette,
} from "lucide-react";

export default function Navbar({
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

  const THEMES = [
    { id: "blue", label: "Blue", color: "#00f0ff", bg: "bg-cyan-500" },
    { id: "green", label: "Green", color: "#00ff9d", bg: "bg-emerald-400" },
    { id: "red", label: "Red", color: "#ff0055", bg: "bg-rose-500" },
  ];

  return (
    <header className="border-b border-theme-accent bg-[#080c16]/95 backdrop-blur sticky top-0 z-50 px-4 py-2 w-full max-w-full min-h-[56px] flex items-center justify-between shadow-lg gap-2 overflow-x-hidden">
      {/* Brand & Circular Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-theme-accent shadow-theme-glow flex items-center justify-center shrink-0 bg-white p-0.5">
          <img
            src="/logo.png"
            alt="ASTRA Logo"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-base md:text-lg tracking-wider text-slate-100 uppercase leading-none whitespace-nowrap">
              PROJECT <span className="text-theme-accent">ASTRA</span>
            </span>
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/80 font-bold tracking-widest leading-none whitespace-nowrap">
              RESTRICTED // NTRO
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 whitespace-nowrap mt-1 leading-none">
            <span className="text-theme-accent font-bold">SIH26151</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-sans">Dark Web Threat De-Anonymization</span>
          </div>
        </div>
      </div>

      {/* Right Controls: Theme Switcher, Clearance, Clock & Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* DYNAMIC TRI-COLOR THEME SWITCHER */}
        <div className="flex items-center gap-1.5 bg-[#0b1220] border border-slate-800 rounded-lg px-2 py-1 text-xs shrink-0">
          <Palette className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <div className="flex items-center gap-1.5">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => onThemeChange && onThemeChange(t.id)}
                className={`w-4 h-4 rounded-full transition flex items-center justify-center ${
                  activeTheme === t.id
                    ? "ring-2 ring-white scale-110 shadow-sm"
                    : "opacity-60 hover:opacity-100 hover:scale-105"
                }`}
                style={{ backgroundColor: t.color }}
                title={`Switch to ${t.label} Theme`}
              />
            ))}
          </div>
        </div>

        {/* Security Clearance Badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#0e172a] border border-slate-800 rounded-lg px-2.5 py-1 text-xs shrink-0 whitespace-nowrap shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-theme-accent font-mono font-bold text-xs tracking-wider">LEVEL-4 // TOP SECRET</span>
        </div>

        {/* Live Clock (Desktop only) */}
        <div className="hidden xl:flex items-center gap-1.5 bg-[#0b1220] border border-slate-800/80 rounded-lg px-2.5 py-1 text-slate-300 font-mono text-xs shrink-0 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="whitespace-nowrap tabular-nums">{time}</span>
        </div>

        {/* Action Buttons */}
        {onTogglePitchHud && (
          <button
            onClick={onTogglePitchHud}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs font-mono transition shadow-[0_0_10px_rgba(245,158,11,0.25)] whitespace-nowrap shrink-0"
            title="Open 5-Minute Live Pitch Prompter & Timer"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Pitch HUD</span>
          </button>
        )}

        {onToggleVideoModal && (
          <button
            onClick={onToggleVideoModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-theme-accent border border-theme-accent font-bold text-xs font-mono transition whitespace-nowrap shrink-0"
            title="Open Video Architecture Showcase"
          >
            <Film className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Video Demo</span>
          </button>
        )}

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh Intelligence Data"
            className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-theme-accent border border-slate-700 transition shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
}
