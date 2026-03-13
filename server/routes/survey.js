import { Router } from 'express';
import { searchQuestions, getQuestionResults, getCategories, runSQL } from '../services/eumetra.js';

const router = Router();

// GET /api/survey/search?q=keyword
router.get('/search', async (req, res) => {
  try {
    const keyword = req.query.q;
    if (!keyword) return res.status(400).json({ error: 'Missing q parameter' });
    const results = await searchQuestions(keyword, parseInt(req.query.limit) || 20);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/survey/question/:id?category=Sesso
router.get('/question/:id', async (req, res) => {
  try {
    const results = await getQuestionResults(
      parseInt(req.params.id),
      req.query.category || null
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/survey/categories
router.get('/categories', async (req, res) => {
  try {
    const cats = await getCategories();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/survey/topics - Key topics pre-configured for the radar
router.get('/topics', async (req, res) => {
  try {
    const topics = [
      { keyword: 'sostenibilità', label: 'Sostenibilità' },
      { keyword: 'alimentazione', label: 'Alimentazione' },
      { keyword: 'salute', label: 'Salute & Benessere' },
      { keyword: 'spreco', label: 'Spreco Alimentare' },
      { keyword: 'biologico', label: 'Biologico' },
      { keyword: 'made in italy', label: 'Made in Italy' },
      { keyword: 'fiducia', label: 'Fiducia nelle Aziende' },
      { keyword: 'social', label: 'Social Media' },
      { keyword: 'influencer', label: 'Influencer' },
      { keyword: 'pasta', label: 'Pasta' },
    ];

    const results = [];
    for (const topic of topics) {
      const questions = await searchQuestions(topic.keyword, 5);
      results.push({
        ...topic,
        questionCount: questions.length,
        questions: questions.map(q => ({ id: q.id, code: q.code, text: q.text }))
      });
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/survey/sql - Run arbitrary SQL (read-only)
router.post('/sql', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim().toUpperCase().startsWith('SELECT')) {
      return res.status(400).json({ error: 'Only SELECT queries allowed' });
    }
    const results = await runSQL(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
