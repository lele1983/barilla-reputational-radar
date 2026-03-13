import React from 'react';
import { AlertTriangle, TrendingUp, Eye } from 'lucide-react';
import { fDate } from '../utils/format';

const typeConfig = {
  spike: { icon: TrendingUp, bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300' },
  opportunity: { icon: TrendingUp, bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300' },
  risk: { icon: AlertTriangle, bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300' },
  monitor: { icon: Eye, bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300' },
};

export default function AlertCard({ alert }) {
  const cfg = typeConfig[alert.type] || typeConfig.monitor;
  const Icon = cfg.icon;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.bg} ${cfg.border}`}>
      <Icon size={16} className={`${cfg.text} mt-0.5 shrink-0`} />
      <div className="min-w-0">
        <div className="text-sm font-medium">{alert.message}</div>
        {alert.detail && <div className="text-xs text-gray-400 mt-0.5">{alert.detail}</div>}
        <div className="text-[10px] text-gray-500 mt-1">{fDate(alert.date)}</div>
      </div>
      <span className={`badge ml-auto shrink-0 badge-${alert.priority || 'medium'}`}>{alert.priority || 'info'}</span>
    </div>
  );
}
