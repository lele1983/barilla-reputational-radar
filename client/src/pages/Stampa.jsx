import React from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Loading, ErrorState } from '../components/LoadingState';
import KpiCard from '../components/KpiCard';
import { fDate } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Newspaper, ThumbsUp, Building2, Bookmark } from 'lucide-react';

const sentimentColors = { positive: '#22c55e', neutral: '#6b7280', negative: '#ef4444' };
const themeColors = ['#c8102e', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];

export default function Stampa() {
  const { data: stats, loading: l1, error: e1 } = useApi(() => api.pressStats());
  const { data: articles, loading: l2 } = useApi(() => api.pressArticles());

  if (l1 || l2) return <Loading text="Caricamento rassegna stampa..." />;
  if (e1) return <ErrorState message={e1} />;

  const themeData = stats?.themes?.map((t, i) => ({ name: t.name, value: t.count, fill: themeColors[i % themeColors.length] })) || [];
  const sentimentData = stats?.sentimentBreakdown
    ? Object.entries(stats.sentimentBreakdown).map(([name, value]) => ({ name, value, fill: sentimentColors[name] }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rassegna Stampa</h1>
        <p className="text-sm text-gray-400 mt-1">Monitoraggio copertura media e press review</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Articoli Totali" value={stats?.totalArticles || 0} icon={Newspaper} />
        <KpiCard label="Testate Coinvolte" value={stats?.topSources?.length || 0} icon={Building2} />
        <KpiCard label="Tono Positivo/Neutro" value={`${stats?.positivePct || 0}%`} icon={ThumbsUp} />
        <KpiCard label="Temi Coperti" value={stats?.themes?.length || 0} icon={Bookmark} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme distribution */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Distribuzione per Tema</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={themeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}>
                {themeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Analisi Sentiment</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sentimentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
              <Bar dataKey="value" name="Articoli">
                {sentimentData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Sources */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Top Testate</h3>
        <div className="flex flex-wrap gap-2">
          {stats?.topSources?.map(s => (
            <span key={s.name} className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs">
              {s.name} <span className="text-gray-400">({s.count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Articles list */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Articoli Recenti</h3>
        <div className="space-y-3">
          {articles?.articles?.map((a, i) => (
            <div key={i} className="p-3 rounded-lg border border-barilla-border hover:border-barilla-red/30 transition">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="text-xs text-gray-400 mt-1">{a.excerpt}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge badge-low">{a.source}</span>
                    <span className="badge" style={{ backgroundColor: `${sentimentColors[a.sentiment]}20`, color: sentimentColors[a.sentiment], borderColor: `${sentimentColors[a.sentiment]}40` }}>{a.sentiment}</span>
                    <span className="text-[10px] text-gray-500">{fDate(a.date)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
