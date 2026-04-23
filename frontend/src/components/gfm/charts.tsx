import React from "react";

/* ── Area Line chart ── */
interface AreaLineProps {
  data: { m: string; v: number }[];
  width?: number;
  height?: number;
  color?: string;
  accent?: string;
  annotate?: { m: string; label: string };
  format?: (v: number) => string | number;
}
export function AreaLine({
  data, width = 720, height = 220,
  color = "#16A34A", accent = "#F59E0B",
  annotate, format = (v) => v,
}: AreaLineProps) {
  const pad = { t: 20, r: 24, b: 28, l: 40 };
  const vals = data.map(d => d.v);
  const max = Math.max(...vals, 1) * 1.15;
  const min = 0;
  const W = width - pad.l - pad.r;
  const H = height - pad.t - pad.b;
  const step = data.length > 1 ? W / (data.length - 1) : W;
  const pts = data.map((d, i) => [pad.l + i * step, pad.t + H - (d.v - min) / (max - min) * H] as [number, number]);
  const path = pts.map((p, i) => i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`).join(" ");
  const area = `${path} L${pts[pts.length - 1][0]},${pad.t + H} L${pts[0][0]},${pad.t + H} Z`;
  const yTicks = 4;
  const uid = React.useId();
  let annoIdx = -1;
  if (annotate) annoIdx = data.findIndex(d => d.m === annotate.m);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id={`af-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[...Array(yTicks + 1)].map((_, i) => {
        const y = pad.t + (i / yTicks) * H;
        const v = max - (i / yTicks) * (max - min);
        return (
          <g key={i}>
            <line x1={pad.l} x2={width - pad.r} y1={y} y2={y} stroke="#f1f1ee" />
            <text x={pad.l - 10} y={y + 4} textAnchor="end" fontSize="10.5" fill="#9ca3af" fontFamily="Manrope" fontWeight="600">
              {format(Math.round(v))}
            </text>
          </g>
        );
      })}
      <path d={area} fill={`url(#af-${uid})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === annoIdx ? 5 : 3}
          fill="#fff" stroke={i === annoIdx ? accent : color} strokeWidth="2.5" />
      ))}
      {data.map((d, i) => (
        <text key={i} x={pad.l + i * step} y={height - 8} textAnchor="middle"
          fontSize="11" fill="#6b7280" fontFamily="Manrope" fontWeight="600">{d.m}</text>
      ))}
      {annoIdx >= 0 && (() => {
        const [x, y] = pts[annoIdx];
        return (
          <g>
            <line x1={x} x2={x} y1={y} y2={pad.t + H} stroke={accent} strokeDasharray="3 3" strokeWidth="1.2" />
            <g transform={`translate(${x},${y - 18})`}>
              <rect x="-28" y="-16" width="56" height="22" rx="11" fill={accent} />
              <polygon points="-5,6 5,6 0,12" fill={accent} />
              <text x="0" y="-1" textAnchor="middle" fontSize="11" fontWeight="800" fill="#0D121C" fontFamily="Manrope">
                {annotate!.label}
              </text>
            </g>
          </g>
        );
      })()}
    </svg>
  );
}

/* ── Radial / half-donut bars (Farmora-style) ── */
interface RadialBar { label: string; pct: number; color: string; }
interface RadialBarsProps {
  data: RadialBar[];
  width?: number;
  height?: number;
  centerBig?: string;
  centerSub?: string;
}
export function RadialBars({ data, width = 280, height = 200, centerBig, centerSub }: RadialBarsProps) {
  const cx = width / 2, cy = height * 0.92;
  const inner = Math.min(width, height * 2) * 0.28;
  const outer = Math.min(width, height * 2) * 0.46;
  const rings = data.length;
  const segCount = 28;
  const start = Math.PI, end = Math.PI * 2;
  const arc = (r: number, a: number): [number, number] => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {data.map((ring, ri) => {
        const r1 = inner + ri * ((outer - inner) / rings) + 3;
        const r2 = inner + (ri + 1) * ((outer - inner) / rings) - 1;
        return [...Array(segCount)].map((_, si) => {
          const frac = si / (segCount - 1);
          const a = start + frac * (end - start);
          const active = frac <= ring.pct / 100;
          const [x1, y1] = arc(r1, a);
          const [x2, y2] = arc(r2, a);
          return (
            <line key={`${ri}-${si}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={active ? ring.color : "#eeeeec"} strokeWidth="4" strokeLinecap="round" />
          );
        });
      })}
      {centerBig && (
        <>
          <text x={cx} y={cy - 18} textAnchor="middle" fontSize="18" fontWeight="800" fill="#0D121C" fontFamily="Manrope" letterSpacing="-0.02em">
            {centerBig}
          </text>
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="#6b7280" fontFamily="Manrope">
            {centerSub}
          </text>
        </>
      )}
    </svg>
  );
}

/* ── Donut ── */
interface DonutSegment { v: number; color: string; label?: string; }
interface DonutProps {
  data: DonutSegment[];
  size?: number;
  stroke?: number;
  centerTop?: string;
  centerBig?: string;
  centerSub?: string;
}
export function Donut({ data, size = 160, stroke = 22, centerTop, centerBig, centerSub }: DonutProps) {
  const total = data.reduce((s, d) => s + d.v, 0) || 1;
  const r = (size - stroke) / 2;
  const c = Math.PI * 2 * r;
  const cx = size / 2;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: "none" }}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#f1f1ee" strokeWidth={stroke} />
      {data.map((d, i) => {
        const len = (d.v / total) * c;
        const el = (
          <circle key={i} cx={cx} cy={cx} r={r} fill="none"
            stroke={d.color} strokeWidth={stroke}
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={-acc}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cx})`} />
        );
        acc += len;
        return el;
      })}
      {centerTop && <text x={cx} y={cx - 12} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#9ca3af" fontFamily="Manrope" letterSpacing="0.1em">{centerTop}</text>}
      {centerBig && <text x={cx} y={cx + 6} textAnchor="middle" fontSize="20" fontWeight="800" fill="#0D121C" fontFamily="Manrope" letterSpacing="-0.03em">{centerBig}</text>}
      {centerSub && <text x={cx} y={cx + 20} textAnchor="middle" fontSize="10" fontWeight="600" fill="#6b7280" fontFamily="Manrope">{centerSub}</text>}
    </svg>
  );
}

/* ── Grouped bars (Plan vs Actual) ── */
interface GroupedBarsDatum { label: string; planned: number; actual: number; }
interface GroupedBarsProps {
  data: GroupedBarsDatum[];
  width?: number;
  height?: number;
}
export function GroupedBars({ data, width = 1000, height = 260 }: GroupedBarsProps) {
  const pad = { t: 20, r: 20, b: 40, l: 60 };
  const max = Math.max(...data.flatMap(d => [d.planned, d.actual]), 1) * 1.15;
  const W = width - pad.l - pad.r;
  const H = height - pad.t - pad.b;
  const bw = (W / data.length) * 0.34;
  const gw = W / data.length;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {[0, 1, 2, 3, 4].map(i => {
        const y = pad.t + (i / 4) * H;
        return <line key={i} x1={pad.l} x2={width - pad.r} y1={y} y2={y} stroke="#f1f1ee" />;
      })}
      {data.map((d, i) => {
        const x0 = pad.l + i * gw + (gw - bw * 2 - 6) / 2;
        const h1 = (d.planned / max) * H;
        const h2 = (d.actual / max) * H;
        const over = d.actual > d.planned;
        return (
          <g key={i}>
            <rect x={x0} y={pad.t + H - h1} width={bw} height={h1} rx="4" fill="#e5e7eb" />
            <rect x={x0 + bw + 6} y={pad.t + H - h2} width={bw} height={h2} rx="4" fill={over ? "#DC2626" : "#16A34A"} />
            <text x={x0 + bw + 3} y={height - 16} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#374151" fontFamily="Manrope">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Bars (vertical) ── */
interface BarsDatum { m: string; v: number; }
interface BarsProps {
  data: BarsDatum[];
  width?: number;
  height?: number;
  highlight?: string;
  format?: (v: number) => string;
  color?: string;
  accent?: string;
}
export function Bars({ data, width = 320, height = 140, highlight, format = String, color = "#16A34A", accent = "#F59E0B" }: BarsProps) {
  const pad = { t: 24, r: 10, b: 22, l: 10 };
  const max = Math.max(...data.map(d => d.v), 1) * 1.2;
  const W = width - pad.l - pad.r;
  const H = height - pad.t - pad.b;
  const bw = (W / data.length) * 0.6;
  const gap = (W / data.length) * 0.4;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {data.map((d, i) => {
        const h = (d.v / max) * H;
        const x = pad.l + i * (bw + gap) + gap / 2;
        const y = pad.t + H - h;
        const hl = d.m === highlight;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={h} rx="5" fill={hl ? accent : color} opacity={hl ? 1 : 0.85} />
            {hl && <text x={x + bw / 2} y={y - 6} textAnchor="middle" fontSize="10" fontWeight="800" fill="#0D121C" fontFamily="Manrope">{format(d.v)}</text>}
            <text x={x + bw / 2} y={height - 6} textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="Manrope" fontWeight="600">{d.m}</text>
          </g>
        );
      })}
    </svg>
  );
}
