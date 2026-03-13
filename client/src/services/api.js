const BASE = '/api';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  // Social
  socialOverview: (days = 7) => get(`/social/overview?days=${days}`),
  mentions: (brand = 'barilla', days = 30) => get(`/social/mentions?brand=${brand}&days=${days}`),
  trending: (days = 7) => get(`/social/trending?days=${days}`),
  creators: (days = 30, topic = '') => get(`/social/creators?days=${days}${topic ? `&topic=${topic}` : ''}`),
  sentiment: (brand = 'barilla', days = 30) => get(`/social/sentiment?brand=${brand}&days=${days}`),

  // Radar
  radarScore: (brand = 'barilla', days = 30) => get(`/radar/score?brand=${brand}&days=${days}`),
  alerts: () => get('/radar/alerts'),

  // Survey
  surveySearch: (q) => get(`/survey/search?q=${encodeURIComponent(q)}`),
  surveyQuestion: (id, category = '') => get(`/survey/question/${id}${category ? `?category=${category}` : ''}`),
  surveyTopics: () => get('/survey/topics'),
  surveyCategories: () => get('/survey/categories'),

  // Press
  pressArticles: () => get('/press/articles'),
  pressStats: () => get('/press/stats'),

  // Health
  health: () => get('/health'),
};
