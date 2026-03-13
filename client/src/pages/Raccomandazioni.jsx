import React from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Loading } from '../components/LoadingState';
import { fNum, fPct } from '../utils/format';
import { Clock, Zap, Target, Calendar } from 'lucide-react';

export default function Raccomandazioni() {
  const { data: radar, loading } = useApi(() => api.radarScore('barilla', 30));
  const { data: mentions } = useApi(() => api.mentions('barilla', 30));

  if (loading) return <Loading />;

  const weakDimensions = radar?.dimensions?.filter(d => d.score < 65) || [];
  const organicPct = mentions ? Math.round(mentions.organicCount / Math.max(mentions.total, 1) * 100) : 0;

  const recommendations = [
    {
      priority: 1,
      urgency: 'Entro 48 ore',
      title: 'Content Pipeline Organico',
      description: weakDimensions.some(d => d.name === 'Volume')
        ? `Volume menzioni basso (${radar?.kpis?.totalMentions} in 30gg). Attivare pipeline di contenuti organici per aumentare la presenza.`
        : 'Mantenere il volume di menzioni attuale con contenuti programmati.',
      actions: [
        'Pianificare 3-4 contenuti organici settimanali',
        'Coinvolgere creator per menzioni spontanee',
        'Attivare UGC challenge (#MiaPastaBarilla)'
      ],
      kpis: ['50K+ organic reach', '>2% engagement rate'],
      icon: Zap,
      color: 'barilla-red'
    },
    {
      priority: 2,
      urgency: 'Entro 1 settimana',
      title: 'Diversificazione Piattaforme',
      description: weakDimensions.some(d => d.name === 'Platform Mix')
        ? `Platform Mix score ${weakDimensions.find(d => d.name === 'Platform Mix')?.score}/100. Troppa dipendenza da una piattaforma.`
        : 'Espandere la presenza su TikTok e YouTube per bilanciare il mix.',
      actions: [
        'Aumentare contenuti TikTok (+30% volume)',
        'Attivare YouTube Shorts per brand storytelling',
        'Testare format nativi per ogni piattaforma'
      ],
      kpis: ['Ridurre dipendenza IG sotto il 60%', '20%+ contenuti su TikTok'],
      icon: Target,
      color: 'blue-500'
    },
    {
      priority: 3,
      urgency: 'Entro 2 settimane',
      title: 'Riequilibrio Earned/Paid',
      description: `Attualmente ${organicPct}% organico / ${100 - organicPct}% ADV. ${organicPct < 70 ? 'Spostare verso più earned media.' : 'Buon bilanciamento, ottimizzare ulteriormente.'}`,
      actions: [
        'Ridurre saturazione hashtag #adv',
        'Attivare PASTAUT e iniziative sociali come asset organici',
        'Creare contenuti condivisibili che generino menzioni spontanee'
      ],
      kpis: ['Target: 70/30 earned/paid', '>3% save rate sui contenuti'],
      icon: Calendar,
      color: 'emerald-500'
    },
    {
      priority: 4,
      urgency: 'Q2 2026',
      title: 'Heritage 150° Anniversario',
      description: 'Pre-lanciare la narrativa per il 150° anniversario Barilla con contenuti heritage.',
      actions: [
        '"Storie dalla Bottega" — serie di origin stories',
        '"150 Years of Italian Tables" — archivio storico',
        'Docuserie 12 episodi (Aprile 2026 - Marzo 2027)'
      ],
      kpis: ['Posizionamento heritage score >90', 'PR pickup internazionale'],
      icon: Clock,
      color: 'amber-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Raccomandazioni Operative</h1>
        <p className="text-sm text-gray-400 mt-1">Azioni prioritarie basate sui dati del radar</p>
      </div>

      {/* Weak dimensions summary */}
      {weakDimensions.length > 0 && (
        <div className="card border-amber-500/30 bg-amber-500/5">
          <h3 className="text-sm font-medium text-amber-400 mb-2">Aree che Richiedono Attenzione</h3>
          <div className="flex flex-wrap gap-2">
            {weakDimensions.map(d => (
              <span key={d.name} className="badge badge-medium">{d.name}: {d.score}/100</span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="space-y-4">
        {recommendations.map(rec => (
          <div key={rec.priority} className="card hover:border-barilla-red/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-lg bg-${rec.color}/10 shrink-0`}>
                <rec.icon size={20} className={`text-${rec.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold text-barilla-red">PRIORITÀ {rec.priority}</span>
                  <span className="badge badge-low">{rec.urgency}</span>
                </div>
                <h3 className="text-lg font-semibold">{rec.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{rec.description}</p>

                <div className="mt-3">
                  <div className="text-xs font-medium text-gray-300 mb-1.5">Azioni</div>
                  <ul className="space-y-1">
                    {rec.actions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="text-barilla-red mt-0.5">›</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {rec.kpis.map((kpi, i) => (
                    <span key={i} className="badge badge-high">{kpi}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
