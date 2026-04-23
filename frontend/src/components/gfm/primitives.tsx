import React from "react";
import {
  TrendingUp, TrendingDown, Sun, ChevronDown,
  CalendarDays, ArrowUpRight,
} from "lucide-react";

/* ── Stat card ── */
interface StatProps {
  icon: React.ReactNode;
  tone?: "green" | "amber" | "ink" | "blue" | "pink";
  label: string;
  value: string | number;
  sub?: string;
  delta?: number | string;
  down?: boolean;
}
export function Stat({ icon, tone = "green", label, value, sub, delta, down }: StatProps) {
  return (
    <div className="gfm-stat">
      <div className="gfm-stat-head">
        <div className="gfm-stat-label">{label}</div>
        <div className={`gfm-stat-icon ${tone}`}>{icon}</div>
      </div>
      <div className="gfm-stat-value gfm-num">{value}</div>
      <div className="gfm-stat-foot">
        {delta != null && (
          <span className={`gfm-delta ${down ? "down" : ""}`}>
            {down ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
            {down ? "−" : "+"}{delta}%
          </span>
        )}
        {sub && <span>{sub}</span>}
      </div>
    </div>
  );
}

/* ── Hero ── */
interface HeroProps {
  name?: string;
  sub?: string;
  weather?: { t: number; label: string };
  right?: React.ReactNode;
}
export function Hero({ name = "there", sub, weather, right }: HeroProps) {
  return (
    <div className="gfm-hero">
      <div style={{ position: "relative", zIndex: 1 }}>
        <h1>Good morning, {name} <span className="gfm-hero-wave">👋</span></h1>
        {sub && <p>{sub}</p>}
      </div>
      <div className="gfm-hero-right">
        {weather && (
          <div className="gfm-weather">
            <span className="sun"><Sun size={14} strokeWidth={2.25} /></span>
            <b>{weather.t}°C</b><span>{weather.label}</span>
          </div>
        )}
        {right}
      </div>
    </div>
  );
}

/* ── PaceBar ── */
interface PaceBarProps {
  actual: number;
  planned: number;
  expected: number;
}
export function PaceBar({ actual, planned, expected }: PaceBarProps) {
  const val = planned > 0 ? Math.min(actual / planned, 1) : 0;
  const target = planned > 0 ? Math.min(expected / planned, 1) : 0;
  const behind = actual > expected;
  return (
    <div
      className={`gfm-pace ${behind ? "behind" : ""}`}
      style={{ "--val": val, "--target": target } as React.CSSProperties}
    >
      <div className="fill" />
      <div className="hatch" />
      <div className="knob" />
    </div>
  );
}

/* ── PaceCard ── */
interface PaceCardProps {
  title?: string;
  actual: number;
  planned: number;
  expected: number;
  label?: string;
}
export function PaceCard({ title = "Season progress", actual, planned, expected, label }: PaceCardProps) {
  const behind = actual > expected;
  const offset = planned > 0 ? Math.round(Math.abs(actual - expected) / planned * 100) : 0;
  return (
    <div className="gfm-card gfm-card-p">
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, letterSpacing: "-0.015em" }}>{title}</h3>
      <div style={{ marginTop: 16 }}>
        <PaceBar actual={actual} planned={planned} expected={expected} />
      </div>
      <p className="gfm-pace-msg">
        You're {behind
          ? <b style={{ color: "var(--gfm-danger)" }}>behind pace</b>
          : <b style={{ color: "var(--gfm-green-600)" }}>ahead of pace</b>}
        {" — "}<b>{offset}%</b> {behind ? "behind schedule" : "ahead of schedule"}.
      </p>
      {label && <div className="gfm-muted" style={{ fontSize: 11.5, marginTop: 6, fontWeight: 500 }}>{label}</div>}
    </div>
  );
}

/* ── HBar ── */
interface HBarProps {
  planned: number;
  actual: number;
}
export function HBar({ planned, actual }: HBarProps) {
  const p = planned > 0 ? Math.min(actual / planned, 1) : 0;
  const over = actual > planned;
  const warn = !over && p > 0.85;
  return (
    <div
      className={`gfm-hbar ${over ? "over" : warn ? "warn" : ""}`}
      style={{ "--v": `${p * 100}%` } as React.CSSProperties}
    >
      <div className="f" />
    </div>
  );
}

/* ── SectionHead ── */
interface SectionHeadProps {
  title: string;
  sub?: string;
  right?: React.ReactNode;
}
export function SectionHead({ title, sub, right }: SectionHeadProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 14 }}>
      <div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, letterSpacing: "-0.015em" }}>{title}</h3>
        {sub && <div className="gfm-muted" style={{ fontSize: 12, marginTop: 3 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

/* ── Formatters ── */
export const fmt = (n: number) => (n ?? 0).toLocaleString("en-GH", { maximumFractionDigits: 0 });
export const fmtC = (n: number) => "₵" + fmt(n);
export const fmtK = (n: number) => {
  const v = n ?? 0;
  if (Math.abs(v) >= 1000) return "₵" + (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + "k";
  return "₵" + fmt(v);
};
export const pct = (a: number, b: number) => b > 0 ? Math.round(a / b * 100) : 0;

/* ── Category color map ── */
export const CAT_COLORS: Record<string, string> = {
  Seeds: "#16A34A",
  Fertilizer: "#F59E0B",
  Labor: "#0EA5E9",
  Equipment: "#7C3AED",
  Transport: "#14b8a6",
  Feed: "#84CC16",
  Veterinary: "#EF4444",
  Pesticides: "#EC4899",
  Other: "#64748B",
};
export const catColor = (cat: string) => CAT_COLORS[cat] || "#9ca3af";
