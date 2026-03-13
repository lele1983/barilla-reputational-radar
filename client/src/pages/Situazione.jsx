import React from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Loading, ErrorState } from '../components/LoadingState';
import KpiCard from '../components/KpiCard';
import AlertCard from '../components/AlertCard';
import { fNum, fPct, fDateShort, platformColor } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Eye, TrendingUp, Zap, Users } from 'lucide-react';

export default function Situazione() {
  const { data: overview, loading: l1, error: e1 } = useApi(() => api.socialOverview(7));
  const { data: alerts, loading: l2, error: e2 } = useApi(() => api.alerts());
  const { data: mentions, loading: l3 } = useApi(() => api.mentions('barilla', 7));

  if (l1 || l2) return <Loading text="Analisi situazione in corso..." />;
  if (e1) return <ErrorState message={e1} />;

  const chartData = overview?.dailyVolume?.map(d => ({
    date: fDateShort(d.date),
    ig: d.platforms.find(p => p.name === 'ig')?.count || 0,
    tt: d.platforms.find(p => p.name === 'tt')?.count || 0,
    yt: d.platforms.find(p => p.name === 'yt')?.count || 0,
    total: d.count,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quadro della Situazione</h1>
        <p className="text-sm text-gray-400 mt-1">Radar & Alert — ultimi 7 giorni</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Post Monitorati (7gg)" value={fNum(overview?.totalPosts)} icon={Eye} />
        <KpiCard label="Menzioni Barilla (7gg)" value={fNum(mentions?.total || 0)} icon={Users} />
        <KpiCard label="Engagement Rate" value={fPct(overview?.avgEngagementRate)} icon={TrendingUp} />
        <KpiCard label="Engagement Totale" value={fNum(overview?.totalEngagement)} icon={Zap} />
      </div>

      {/* Volume Chart */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Volume Conversazioni per Piattaforma</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#d1d5db' }}
            />
            <Bar dataKey="ig" name="Instagram" stackId="a" fill="#E4405F" radius={[0, 0, 0, 0]} />
            <Bar dataKey="tt" name="TikTok" stackId="a" fill="#00f2ea" />
            <Bar dataKey="yt" name="YouTube" stackId="a" fill="#FF0000" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Alert & Segnalazioni</h3>
        {alerts?.alerts?.length > 0 ? (
          <div className="space-y-2">
            {alerts.alerts.map((a, i) => <AlertCard key={i} alert={a} />)}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">Nessun alert attivo — situazione stabile</div>
        )}
      </div>

      {/* Platform breakdown */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Breakdown Piattaforme</h3>
        <div className="grid grid-cols-3 gap-4">
          {overview?.platforms?.map(p => (
            <div key={p.name} className="text-center p-4 rounded-lg border border-barilla-border">
              <div className="text-2xl font-bold" style={{ color: platformColor(p.name) }}>{fNum(p.count)}</div>
              <div className="text-xs text-gray-400 mt-1">{p.name === 'ig' ? 'Instagram' : p.name === 'tt' ? 'TikTok' : 'YouTube'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
