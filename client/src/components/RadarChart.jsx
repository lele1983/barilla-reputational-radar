import React from 'react';

export default function RadarChart({ dimensions, size = 300 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const n = dimensions.length;

  function polar(i, val) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const dist = (val / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  }

  const gridLevels = [25, 50, 75, 100];
  const points = dimensions.map((d, i) => polar(i, d.score));
  const polygon = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-sm mx-auto">
      {/* Grid circles */}
      {gridLevels.map(level => {
        const pts = Array.from({ length: n }, (_, i) => polar(i, level));
        return (
          <polygon
            key={level}
            points={pts.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#374151"
            strokeWidth={level === 100 ? 1 : 0.5}
            opacity={0.5}
          />
        );
      })}

      {/* Axis lines */}
      {dimensions.map((_, i) => {
        const p = polar(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#374151" strokeWidth={0.5} opacity={0.3} />;
      })}

      {/* Data polygon */}
      <polygon points={polygon} fill="rgba(200,16,46,0.15)" stroke="#c8102e" strokeWidth={2} />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={dimensions[i].color || '#c8102e'} stroke="#0a1628" strokeWidth={2} />
      ))}

      {/* Labels */}
      {dimensions.map((d, i) => {
        const lp = polar(i, 120);
        return (
          <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" className="fill-gray-300 text-[10px] font-medium">
            {d.name}
          </text>
        );
      })}

      {/* Scores */}
      {dimensions.map((d, i) => {
        const sp = polar(i, 108);
        return (
          <text key={`s${i}`} x={sp.x} y={sp.y + 12} textAnchor="middle" className="fill-gray-500 text-[8px]">
            {d.score}
          </text>
        );
      })}
    </svg>
  );
}
