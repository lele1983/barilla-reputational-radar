import React from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Loading, ErrorState } from '../components/LoadingState';
import KpiCard from '../components/KpiCard';
import { fNum, fPct, fDate, platformIcon, platformColor, platformBadgeClass } from '../utils/format';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { MessageSquare, Heart, Share2, Eye } from 'lucide-react';

export default function Conversazione() {
  const { data, loading, error, refetch } = useApi(() => api.mentions('barilla', 30));

  if (loading) return <Loading text="Analisi menzioni Barilla..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  const trendData = data.dailyTrend?.map(d => ({
    date: new Date(d.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }),
    menzioni: d.count,
    engagement: d.engagement
  })) || [];

  const typeData = data.byType?.map(b => ({ name: b.name, value: b.count })) || [];
  const typeColors = { reel: '#E4405F', video: '#00f2ea', carousel: '#8b5cf6', post: '#f59e0b', short: '#FF0000' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Barilla nella Conversazione</h1>
        <p className="text-sm text-gray-400 mt-1">Analisi menzioni e brand presence — ultimi 30 giorni</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Menzioni Totali" value={fNum(data.total)} icon={MessageSquare} />
        <KpiCard label="Engagement Medio" value={fNum(Math.round(data.avgEngagement || 0))} icon={Heart} />
        <KpiCard label="Engagement Rate" value={fPct(data.avgEngagementRate)} icon={Eye} />
        <KpiCard label="Organici vs Sponsored" value={`${data.organicCount}/${data.sponsoredCount}`} subtitle={`${Math.round(data.organicCount / Math.max(data.total, 1) * 100)}% organic`} icon={Share2} />
      </div>

      {/* Trend */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Trend Menzioni Giornaliere</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="menzioni" stroke="#c8102e" strokeWidth={2} dot={{ fill: '#c8102e', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform breakdown */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Per Piattaforma</h3>
          <div className="space-y-3">
            {data.byPlatform?.map(p => {
              const pct = data.total > 0 ? (p.count / data.total * 100).toFixed(0) : 0;
              return (
                <div key={p.name} className="flex items-center gap-3">
                  <span className={`badge ${platformBadgeClass(p.name)}`}>{platformIcon(p.name)}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{p.count} menzioni</span>
                      <span className="text-gray-400">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: platformColor(p.name) }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Format distribution */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Per Formato</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {typeData.map((entry, i) => (
                  <Cell key={i} fill={typeColors[entry.name] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Hashtags */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Hashtag Associati</h3>
        <div className="flex flex-wrap gap-2">
          {data.topHashtags?.map(h => (
            <span key={h.tag} className="px-3 py-1.5 rounded-full bg-barilla-red/10 text-barilla-red text-xs border border-barilla-red/20">
              #{h.tag} <span className="text-gray-400 ml-1">({h.count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Top Mentions Table */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Top Menzioni per Engagement</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-barilla-border">
                <th className="text-left pb-3 pl-2">Creator</th>
                <th className="text-left pb-3">Piattaforma</th>
                <th className="text-left pb-3">Tipo</th>
                <th className="text-right pb-3">Engagement</th>
                <th className="text-right pb-3">ER</th>
                <th className="text-left pb-3 pl-4">Sponsored</th>
                <th className="text-left pb-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {data.mentions?.slice(0, 15).map((m, i) => (
                <tr key={m.id || i} className="border-b border-barilla-border/50 hover:bg-white/5">
                  <td className="py-2.5 pl-2 font-medium">@{m.channelName}</td>
                  <td><span className={`badge ${platformBadgeClass(m.platform)}`}>{platformIcon(m.platform)}</span></td>
                  <td className="text-gray-400">{m.post_type}</td>
                  <td className="text-right font-semibold text-emerald-400">{fNum(m.engagement)}</td>
                  <td className="text-right text-gray-400">{fPct(m.engagement_rate)}</td>
                  <td className="pl-4">{m.is_sponsored ? <span className="badge badge-medium">ADV</span> : <span className="badge badge-high">Organic</span>}</td>
                  <td className="text-gray-400">{fDate(m.published_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
