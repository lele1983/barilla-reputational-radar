import React from 'react';
import { changeIndicator } from '../utils/format';

export default function KpiCard({ label, value, change, subtitle, icon: Icon, color = 'barilla-red' }) {
  const ch = changeIndicator(change);

  return (
    <div className="kpi-card group hover:border-barilla-red/30 transition-colors">
      {Icon && (
        <div className={`mb-2 p-2 rounded-lg bg-${color}/10`}>
          <Icon size={18} className={`text-${color}`} />
        </div>
      )}
      <div className="text-3xl font-bold tracking-tight">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
      {change != null && (
        <div className={`text-xs mt-1.5 font-medium ${ch.cls}`}>{ch.text} vs periodo precedente</div>
      )}
      {subtitle && <div className="text-[10px] text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}
