import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import socialRoutes from './routes/social.js';
import surveyRoutes from './routes/survey.js';
import radarRoutes from './routes/radar.js';
import pressRoutes from './routes/press.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static frontend in production
app.use(express.static(join(__dirname, '../client/dist')));

// API routes
app.use('/api/social', socialRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/radar', radarRoutes);
app.use('/api/press', pressRoutes);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// SPA fallback
app.get('*', (_, res) => {
  res.sendFile(join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => console.log(`Barilla Radar API running on port ${PORT}`));
