import React from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Loading, ErrorState } from '../components/LoadingState';
import RadarChart from '../components/RadarChart';
import { fNum, fPct } from '../utils/format';

export default function Sintesi() {
  const { data: radar, loading, error, refetch } = useApi(() => api.radarScore('barilla', 30));

  if (loading) return <Loading text="Generazione sintesi radar..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!radar) return null;

  const strengths = radar.dimensions.filter(d => d.score >= 75);
  const improvements = radar.dimensions.filter(d => d.score < 75);
  const scoreColor = radar.overallScore >= 75 ? 'text-emerald-400' : radar.overallScore >= 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sintesi Radar</h1>
        <p className="text-sm text-gray-400 mt-1">Scorecard reputazionale a 8 dimensioni</p>
      </div>

      {/* Overall */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card flex flex-col items-center justify-center py-8">
          <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Score Complessivo</div>
          <div className={`text-8xl font-black ${scoreColor}`}>{radar.overallScore}</div>
          <div className="text-lg text-gray-400">/100</div>
          <div className="mt-3 text-sm text-gray-300 text-center">
            {radar.overallScore >= 75 ? 'Eccellente posizione reputazionale' :
             radar.overallScore >= 60 ? 'Posizione reputazionale solida con margini di miglioramento' :
             'Richiede interventi prioritari'}
          </div>
        </div>
        <div className="card lg:col-span-2">
          <RadarChart dimensions={radar.dimensions} size={350} />
        </div>
      </div>

      {/* Dimension cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {radar.dimensions.map(d => {
          const bg = d.score >= 75 ? 'border-emerald-500/20 bg-emerald-500/5' :
                     d.score >= 50 ? 'border-amber-500/20 bg-amber-500/5' :
                     'border-red-500/20 bg-red-500/5';
          const textColor = d.score >= 75 ? 'text-emerald-400' : d.score >= 50 ? 'text-amber-400' : 'text-red-400';
          return (
            <div key={d.name} className={`card border ${bg}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">{d.name}</span>
                <span className={`text-2xl font-bold ${textColor}`}>{d.score}</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.score}%`, backgroundColor: d.color }} />
              </div>
              <div className="text-xs text-gray-400">{d.description}</div>
            </div>
          );
        })}
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card border-emerald-500/20">
          <h3 className="text-sm font-medium text-emerald-400 mb-3">Punti di Forza</h3>
          <ul className="space-y-2">
            {strengths.map(s => (
              <li key={s.name} className="flex items-center gap-2 text-sm">
                <span className="text-emerald-400">✓</span>
                <span className="font-medium">{s.name}</span>
                <span className="text-gray-400">({s.score}/100)</span>
              </li>
            ))}
            {strengths.length === 0 && <li className="text-sm text-gray-500">Nessuna dimensione sopra 75</li>}
          </ul>
        </div>
        <div className="card border-amber-500/20">
          <h3 className="text-sm font-medium text-amber-400 mb-3">Aree di Miglioramento</h3>
          <ul className="space-y-2">
            {improvements.map(s => (
              <li key={s.name} className="flex items-center gap-2 text-sm">
                <span className="text-amber-400">!</span>
                <span className="font-medium">{s.name}</span>
                <span className="text-gray-400">({s.score}/100)</span>
              </li>
            ))}
            {improvements.length === 0 && <li className="text-sm text-gray-500">Tutte le dimensioni sopra 75</li>}
          </ul>
        </div>
      </div>

      {/* Quick stats */}
      <div className="card bg-barilla-dark">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Metriche Chiave del Periodo</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{fNum(radar.kpis.totalMentions)}</div>
            <div className="text-xs text-gray-400">Menzioni</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{fNum(radar.kpis.totalEngagement)}</div>
            <div className="text-xs text-gray-400">Engagement</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{fPct(radar.kpis.avgEngagementRate)}</div>
            <div className="text-xs text-gray-400">Avg ER</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{radar.kpis.organicCount}/{radar.kpis.sponsoredCount}</div>
            <div className="text-xs text-gray-400">Organic/Paid</div>
          </div>
        </div>
      </div>
    </div>
  );
}
