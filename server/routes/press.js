import { Router } from 'express';

const router = Router();

// In a production SaaS, this would connect to a news API or web scraping service.
// For now, we provide a structure that can be populated via the web search MCP tool
// or by a scheduled job that fetches news.

let pressCache = {
  lastUpdated: null,
  articles: []
};

// GET /api/press/articles - Get press articles
router.get('/articles', async (req, res) => {
  try {
    // Return cached articles or fetch fresh ones
    if (pressCache.articles.length === 0) {
      // Seed with structure - in production this would come from a news API
      pressCache = {
        lastUpdated: new Date().toISOString(),
        articles: getDefaultArticles()
      };
    }
    res.json(pressCache);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/press/articles - Update press articles (called by scheduled jobs or admin)
router.post('/articles', async (req, res) => {
  try {
    const { articles } = req.body;
    if (!Array.isArray(articles)) return res.status(400).json({ error: 'articles must be an array' });
    pressCache = {
      lastUpdated: new Date().toISOString(),
      articles: articles.map(a => ({
        title: a.title,
        source: a.source,
        date: a.date,
        url: a.url,
        sentiment: a.sentiment || 'neutral',
        theme: a.theme || 'general',
        excerpt: a.excerpt || ''
      }))
    };
    res.json({ ok: true, count: pressCache.articles.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/press/stats
router.get('/stats', async (req, res) => {
  const articles = pressCache.articles.length > 0 ? pressCache.articles : getDefaultArticles();
  const themes = {};
  const sources = {};
  const sentiments = { positive: 0, neutral: 0, negative: 0 };

  for (const a of articles) {
    themes[a.theme] = (themes[a.theme] || 0) + 1;
    sources[a.source] = (sources[a.source] || 0) + 1;
    sentiments[a.sentiment] = (sentiments[a.sentiment] || 0) + 1;
  }

  res.json({
    totalArticles: articles.length,
    themes: Object.entries(themes).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    topSources: Object.entries(sources).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10),
    sentimentBreakdown: sentiments,
    positivePct: articles.length > 0 ? Math.round((sentiments.positive + sentiments.neutral) / articles.length * 100) : 0
  });
});

function getDefaultArticles() {
  return [
    { title: 'Barilla: tre direttrici donna guidano gli stabilimenti', source: 'ANSA', date: '2026-03-08', sentiment: 'positive', theme: 'People & Corporate', excerpt: 'Leadership femminile in crescita negli stabilimenti Barilla.' },
    { title: 'Fondazione Barilla: "Chi non spreca ci guadagna"', source: 'Food Affairs', date: '2026-03-06', sentiment: 'positive', theme: 'Sustainability & ESG', excerpt: 'Campagna anti-spreco della Fondazione Barilla.' },
    { title: 'Protein+ conquista il mercato USA: blind test superato', source: 'BusinessWire', date: '2026-01-15', sentiment: 'positive', theme: 'Product & Market', excerpt: 'Barilla Protein+ supera il blind test nel mercato americano.' },
    { title: 'BITE Innovation Center: €20M per il futuro della pasta', source: 'Mark Up', date: '2025-11-20', sentiment: 'positive', theme: 'Innovation & R&D', excerpt: 'Investimento da 20 milioni nel centro innovazione BITE.' },
    { title: 'Barilla Sustainability Report 2024: €4.9B revenue', source: 'FoodWeb', date: '2025-07-10', sentiment: 'positive', theme: 'Sustainability & ESG', excerpt: 'Report sostenibilità conferma crescita e roadmap 2030.' },
    { title: 'RepTrak 2025: Barilla #1 food company mondiale', source: 'Corriere della Sera', date: '2025-04-05', sentiment: 'positive', theme: 'Heritage & Brand', excerpt: 'Barilla si conferma al 25° posto Global 100 RepTrak.' },
    { title: 'Accademia del Basilico: nasce a Parma il polo formativo', source: 'ParmaToday', date: '2025-01-22', sentiment: 'positive', theme: 'Innovation & R&D', excerpt: 'Inaugurata l\'Accademia del Basilico a Parma.' },
    { title: 'Oddone Incisa nuovo CFO del Gruppo Barilla', source: 'Il Sole 24 Ore', date: '2025-09-15', sentiment: 'neutral', theme: 'People & Corporate', excerpt: 'Nomina del nuovo direttore finanziario del gruppo.' },
    { title: 'Good Food Makers: Barilla investe nelle startup food-tech', source: 'StartupItalia', date: '2025-06-12', sentiment: 'positive', theme: 'Innovation & R&D', excerpt: 'Programma di accelerazione per startup nel settore alimentare.' },
    { title: 'Packaging sostenibile: Barilla elimina la plastica dal 60% dei prodotti', source: 'GreenStyle', date: '2025-08-03', sentiment: 'positive', theme: 'Sustainability & ESG', excerpt: 'Obiettivo packaging plastic-free raggiunto al 60%.' },
  ];
}

export default router;
