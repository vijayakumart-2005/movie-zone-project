import React, { useEffect, useState } from "react";
import "../styles/ScoreGauge.css";

// Five colour bands, from "Very Bad" to "Excellent".
// `upto` is the end of the band as a fraction (0-1) of the full scale.
export const BANDS = [
  { label: "Very Bad", color: "#e5280a", upto: 0.4 },
  { label: "Bad", color: "#ff6d00", upto: 0.55 },
  { label: "Fair", color: "#ffb36b", upto: 0.65 },
  { label: "Good", color: "#7ccf74", upto: 0.75 },
  { label: "Excellent", color: "#4aa82a", upto: 1 },
];

const CX = 160;
const CY = 160;
const R = 105; // radius of the middle of the coloured ring
const STROKE = 30;
const LABEL_R = R + STROKE / 2 + 14;

// angle in degrees: 180 = far left, 0 = far right
const point = (angle, radius) => {
  const rad = (angle * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY - radius * Math.sin(rad)];
};

const arcPath = (fromFrac, toFrac) => {
  const [x1, y1] = point(180 - 180 * fromFrac, R);
  const [x2, y2] = point(180 - 180 * toFrac, R);
  return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
};

const formatNumber = (n, decimals) =>
  decimals > 0 ? n.toFixed(decimals) : String(Math.round(n));

function ScoreGauge({
  title,
  value,
  min = 0,
  max = 10,
  decimals = 1,
  unit = "",
  subtitle = "",
  emptyText = "N/A",
}) {
  const hasValue = typeof value === "number" && !isNaN(value);
  const frac = hasValue ? Math.min(Math.max((value - min) / (max - min), 0), 1) : 0;
  const band = BANDS.find((b) => frac <= b.upto) || BANDS[BANDS.length - 1];

  // animate the marker from the left edge to its final position
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(frac), 50);
    return () => clearTimeout(t);
  }, [frac]);

  let start = 0;
  const segments = BANDS.map((b) => {
    const d = arcPath(start, b.upto);
    start = b.upto;
    return <path key={b.label} d={d} stroke={b.color} strokeWidth={STROKE} fill="none" />;
  });

  // scale labels at the band boundaries (plus both ends)
  const ticks = [0, ...BANDS.slice(0, -1).map((b) => b.upto), 1].map((f) => {
    const [x, y] = point(180 - 180 * f, LABEL_R);
    const anchor = f === 0 ? "end" : f === 1 ? "start" : "middle";
    return (
      <text key={f} x={x} y={y} textAnchor={anchor} className="gauge_tick">
        {formatNumber(min + f * (max - min), decimals)}
      </text>
    );
  });

  return (
    <div className="gauge_card">
      <h2 className="gauge_title">{title}</h2>
      <svg viewBox="0 0 320 200" className="gauge_svg" role="img"
        aria-label={`${title}: ${hasValue ? formatNumber(value, decimals) + unit + " - " + band.label : emptyText}`}>
        {/* soft backdrop ring */}
        <path d={arcPath(0, 1)} stroke="#2b2b2b" strokeWidth={STROKE + 14} fill="none" />
        {segments}
        {ticks}

        {/* marker */}
        {hasValue && (
          <g
            style={{
              transform: `rotate(${180 * shown}deg)`,
              transformOrigin: `${CX}px ${CY}px`,
              transition: "transform 1s ease-out",
            }}
          >
            <circle cx={CX - R} cy={CY} r={STROKE / 2 + 2} fill="#1a1a1a" stroke="#fff" strokeWidth="3" />
            <circle cx={CX - R} cy={CY} r={4} fill="#fff" />
          </g>
        )}

        {/* centre readout */}
        <text x={CX} y={CY - 8} textAnchor="middle" className="gauge_value">
          {hasValue ? `${formatNumber(value, decimals)}${unit}` : emptyText}
        </text>
        {hasValue && (
          <text x={CX} y={CY + 24} textAnchor="middle" className="gauge_band" fill={band.color}>
            {band.label}
          </text>
        )}
      </svg>
      {subtitle && <p className="gauge_subtitle">{subtitle}</p>}
    </div>
  );
}

export default ScoreGauge;
