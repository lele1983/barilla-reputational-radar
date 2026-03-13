import React from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Loading, ErrorState } from '../components/LoadingState';
import KpiCard from '../components/KpiCard';
import RadarChart from '../components/RadarChart';
import { fNum, fPct } from '../utils/format';
import { Activity, Eye, TrendingUp, Shield, Zap, Globe } from 'lucide-react';

export default function IlRadar() {
  const { data, loading, error, refetch } = useApi(() => api.radarScore('barilla', 30));

  if (loading) return <Loading text="Calcolo punteggio radar..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  const scoreColor = data.overallScore >= 75 ? 'text-emerald-400' : data.overallScore >= 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Il Radar Reputazionale</h1>
        <p className="text-sm text-gray-400 mt-1">Sistema di intelligence per la reputazione digitale di Barilla Group</p>
      </div>

      {/* Overall Score + Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card flex flex-col items-center justify-center py-8">
          <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider">Punteggio Complessivo</div>
          <div className={`text-7xl font-extrabold ${scoreColor}`}>{data.overallScore}</div>
          <div className="text-sm text-gray-400 mt-1">/100</div>
          <div className="mt-4 text-sm text-gray-300">
            {data.overallScore >= 75 ? 'Posizione reputazionale eccellente' :
             data.overallScore >= 60 ? 'Posizione reputazionale solida' :
             'Richiede attenzione'}
          </div>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400 mb-3 text-center">8 Dimensioni Reputazionali</h3>
          <RadarChart dimensions={data.dimensions} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Menzioni Totali" value={fNum(data.kpis.totalMentions)} change={data.kpis.volumeChange} icon={Eye} />
        <KpiCard label="Engagement Totale" value={fNum(data.kpis.totalEngagement)} icon={TrendingUp} />
        <KpiCard label="Engagement Rate Medio" value={fPct(data.kpis.avgEngagementRate)} change={data.kpis.engagementChange} icon={Activity} />
        <KpiCard label="Contenuti Organici" value={`${Math.round(data.kpis.organicCount / Math.max(data.kpis.totalMentions, 1) * 100)}%`} icon={Globe} />
      </div>

      {/* Dimensions detail */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Dettaglio Dimensioni</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.dimensions.map(d => (
            <div key={d.name} className="p-3 rounded-lg bg-barilla-dark border border-barilla-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-300">{d.name}</span>
                <span className={`text-lg font-bold ${d.score >= 75 ? 'text-emerald-400' : d.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{d.score}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${d.score}%`, backgroundColor: d.color }} />
              </div>
              <div className="text-[10px] text-gray-500 mt-1.5">{d.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data sources */}
      <div className="card bg-barilla-dark">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Fonti Dati Integrate</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center text-xs">
          {[
            { name: 'OpenSearch', desc: 'Social Listening IG/TT/YT', color: 'text-blue-400' },
            { name: 'GWI', desc: 'Consumer Intelligence Globale', color: 'text-purple-400' },
            { name: 'Eumetra', desc: 'Survey Italiani 2025/26', color: 'text-emerald-400' },
            { name: 'Web & News', desc: 'Rassegna Stampa & Media', color: 'text-amber-400' },
          ].map(s => (
            <div key={s.name} className="p-3 rounded-lg border border-barilla-border">
              <div className={`font-semibold ${s.color}`}>{s.name}</div>
              <div className="text-gray-500 mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
