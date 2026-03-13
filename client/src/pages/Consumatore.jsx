import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Loading, ErrorState } from '../components/LoadingState';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Consumatore() {
  const { data: topics, loading, error, refetch } = useApi(() => api.surveyTopics());
  const [selectedQ, setSelectedQ] = useState(null);
  const { data: qResults, loading: loadingQ } = useApi(
    () => selectedQ ? api.surveyQuestion(selectedQ, 'TOTALE') : Promise.resolve(null),
    [selectedQ],
    !!selectedQ
  );

  if (loading) return <Loading text="Caricamento dati Eumetra..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const chartData = qResults?.map(r => ({
    response: r.response?.length > 40 ? r.response.slice(0, 40) + '…' : r.response,
    percentage: r.percentage
  })).filter(r => r.percentage > 0) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Voce del Consumatore</h1>
        <p className="text-sm text-gray-400 mt-1">Consumer intelligence da Eumetra Benessere 25/26 — {topics?.length || 0} temi mappati</p>
      </div>

      {/* Topic grid */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Temi Chiave nel Survey Eumetra</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {topics?.map(t => (
            <button
              key={t.keyword}
              onClick={() => t.questions[0] && setSelectedQ(t.questions[0].id)}
              className={`p-3 rounded-lg border text-left transition hover:border-barilla-red/50 ${
                selectedQ && t.questions.some(q => q.id === selectedQ)
                  ? 'border-barilla-red bg-barilla-red/10'
                  : 'border-barilla-border'
              }`}
            >
              <div className="text-sm font-medium">{t.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{t.questionCount} domande</div>
            </button>
          ))}
        </div>
      </div>

      {/* Question details */}
      {selectedQ && (
        <div className="card">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Risultati Domanda</h3>
          {loadingQ ? (
            <Loading text="Caricamento risultati..." />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 35)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 200 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} unit="%" />
                <YAxis type="category" dataKey="response" tick={{ fill: '#d1d5db', fontSize: 10 }} width={200} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} formatter={(v) => `${v}%`} />
                <Bar dataKey="percentage" name="%" fill="#c8102e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">Nessun risultato per questa domanda</div>
          )}
        </div>
      )}

      {/* Questions list */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Esplora Domande per Tema</h3>
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {topics?.flatMap(t => t.questions).map(q => (
            <button
              key={q.id}
              onClick={() => setSelectedQ(q.id)}
              className={`w-full text-left p-2.5 rounded-lg text-sm transition hover:bg-white/5 ${
                selectedQ === q.id ? 'bg-barilla-red/10 border border-barilla-red/20' : ''
              }`}
            >
              <span className="text-gray-500 text-xs mr-2">{q.code}</span>
              <span className="text-gray-200">{q.text?.slice(0, 120)}{q.text?.length > 120 ? '…' : ''}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
