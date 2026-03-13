import React from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Loading, ErrorState } from '../components/LoadingState';
import { fNum, platformColor, platformIcon } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie } from 'recharts';

export default function Agenda() {
  const { data: trending, loading, error, refetch } = useApi(() => api.trending(7));
  const { data: overview } = useApi(() => api.socialOverview(7));

  if (loading) return <Loading text="Analisi agenda pubblica..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const hashtagData = trending?.hashtags?.slice(0, 15).map(h => ({
    tag: `#${h.tag}`,
    count: h.count,
    engagement: h.engagement
  })) || [];

  const platformData = overview?.platforms?.map(p => ({
    name: platformIcon(p.name),
    value: p.count,
    color: platformColor(p.name)
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agenda Pubblica</h1>
        <p className="text-sm text-gray-400 mt-1">Temi dominanti nel social media italiano questa settimana</p>
      </div>

      {/* Top hashtags chart */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Top Hashtag per Volume (7 giorni)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={hashtagData} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis type="category" dataKey="tag" tick={{ fill: '#d1d5db', fontSize: 11 }} width={100} />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
              formatter={(v) => fNum(v)}
            />
            <Bar dataKey="count" name="Post" fill="#c8102e" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Platform distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Distribuzione per Piattaforma</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={platformData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {platformData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} formatter={(v) => fNum(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Top Creator della Settimana</h3>
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {trending?.creators?.slice(0, 10).map((c, i) => (
              <div key={c.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                <span className="text-xs text-gray-500 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">@{c.name}</div>
                  <div className="text-[10px] text-gray-500">{platformIcon(c.platform)} · {fNum(c.followers)} followers</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-emerald-400">{fNum(c.engagement)}</div>
                  <div className="text-[10px] text-gray-500">{c.posts} post</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
