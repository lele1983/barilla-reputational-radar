import React from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Loading, ErrorState } from '../components/LoadingState';
import AlertCard from '../components/AlertCard';
import { fNum } from '../utils/format';

export default function Opportunita() {
  const { data, loading, error, refetch } = useApi(() => api.alerts());
  const { data: radar } = useApi(() => api.radarScore('barilla', 30));

  if (loading) return <Loading text="Analisi opportunità e rischi..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const opportunities = data?.alerts?.filter(a => a.type === 'opportunity') || [];
  const spikes = data?.alerts?.filter(a => a.type === 'spike') || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Opportunità & Rischi</h1>
        <p className="text-sm text-gray-400 mt-1">Matrice impatto/urgenza e segnalazioni attive</p>
      </div>

      {/* Impact Matrix placeholder with real data */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Matrice Impatto × Urgenza</h3>
        <div className="relative w-full aspect-square max-w-md mx-auto bg-barilla-dark rounded-lg border border-barilla-border p-4">
          {/* Quadrants */}
          <div className="absolute inset-4 grid grid-cols-2 grid-rows-2">
            <div className="border-r border-b border-barilla-border/30 flex items-center justify-center text-xs text-gray-600">Monitorare</div>
            <div className="border-b border-barilla-border/30 flex items-center justify-center text-xs text-gray-600">Agire Subito</div>
            <div className="border-r border-barilla-border/30 flex items-center justify-center text-xs text-gray-600">Bassa priorità</div>
            <div className="flex items-center justify-center text-xs text-gray-600">Pianificare</div>
          </div>
          {/* Axis labels */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-gray-500">IMPATTO →</div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] text-gray-500">URGENZA →</div>
          {/* Data points */}
          {opportunities.slice(0, 4).map((opp, i) => {
            const positions = [
              { left: '70%', top: '20%' },
              { left: '40%', top: '30%' },
              { left: '80%', top: '60%' },
              { left: '25%', top: '70%' },
            ];
            const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500'];
            return (
              <div
                key={i}
                className={`absolute w-8 h-8 rounded-full ${colors[i]} flex items-center justify-center text-[10px] font-bold text-white shadow-lg cursor-pointer hover:scale-110 transition`}
                style={positions[i]}
                title={opp.message}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Opportunities */}
      <div className="card">
        <h3 className="text-sm font-medium text-emerald-400 mb-4">Opportunità Attive ({opportunities.length})</h3>
        {opportunities.length > 0 ? (
          <div className="space-y-2">{opportunities.map((a, i) => <AlertCard key={i} alert={a} />)}</div>
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm">Nessuna opportunità rilevata nel periodo</div>
        )}
      </div>

      {/* Spikes / Anomalies */}
      <div className="card">
        <h3 className="text-sm font-medium text-amber-400 mb-4">Picchi di Volume ({spikes.length})</h3>
        {spikes.length > 0 ? (
          <div className="space-y-2">{spikes.map((a, i) => <AlertCard key={i} alert={a} />)}</div>
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm">Nessun picco anomalo rilevato</div>
        )}
      </div>

      {/* Risk indicators from radar */}
      {radar && (
        <div className="card">
          <h3 className="text-sm font-medium text-red-400 mb-4">Indicatori di Rischio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {radar.dimensions.filter(d => d.score < 60).map(d => (
              <div key={d.name} className="p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{d.name}</span>
                  <span className="text-lg font-bold text-red-400">{d.score}/100</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">{d.description}</div>
              </div>
            ))}
            {radar.dimensions.filter(d => d.score < 60).length === 0 && (
              <div className="col-span-2 text-center py-4 text-gray-500 text-sm">Nessuna dimensione critica (&lt;60) — situazione stabile</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
