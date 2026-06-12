require('dotenv').config();
const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss');

const app = express();

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:8000').split(',');
const COACH_API_SECRET = process.env.COACH_API_SECRET || '';
const MAX_RESPONSE_TOKENS = Number(process.env.MAX_RESPONSE_TOKENS || 800);

// Basic security headers
app.use(helmet());
app.use(express.json({ limit: '64kb' }));

// CORS: allow only configured origins
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('Origin not allowed'));
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_WINDOW_MS || 60000),
  max: Number(process.env.RATE_MAX || 60),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, slow down.' }
});
app.use(limiter);

function requireSecret(req, res, next) {
  if (!COACH_API_SECRET) return next();
  const provided = req.headers['x-api-secret'] || req.query.api_secret;
  if (!provided || provided !== COACH_API_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  return next();
}

// Simple health endpoint
app.get('/health', (req, res) => res.json({ ok: true, time: Date.now() }));

// POST /api/coach — body: { message: string, sessionId?: string, lang?: string }
app.post('/api/coach', requireSecret, async (req, res) => {
  try {
    const { message, sessionId } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) return res.status(400).json({ error: 'Invalid message' });
    // sanitize minimal user input to avoid injection in logs
    const safeMessage = xss(message).slice(0, 2000);

    if (!OPENAI_API_KEY) return res.status(500).json({ error: 'Server not configured with OPENAI_API_KEY' });

    // system prompt to ensure empathetic, multilingual responses and safety
    const systemPrompt = `You are an empathetic, safety-first recovery coach. Respond kindly and helpfully. Keep replies actionable and concise. If the user writes in a language other than English, reply in the same language. If the user expresses imminent self-harm or danger, respond with supportive language and advise them to contact local emergency services and include crisis resources; do not provide instructions to harm. Keep responses under ${MAX_RESPONSE_TOKENS} tokens.`;

    const payload = {
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: safeMessage }
      ],
      max_tokens: MAX_RESPONSE_TOKENS,
      temperature: 0.8
    };

    const resp = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      timeout: 30_000
    });

    const reply = (resp.data && resp.data.choices && resp.data.choices[0] && resp.data.choices[0].message && resp.data.choices[0].message.content) || '';
    return res.json({ reply, model: OPENAI_MODEL });
  } catch (err) {
    console.error('coach error', err && err.message);
    return res.status(500).json({ error: 'Coach request failed', detail: err && err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Ascendra LLM proxy listening on port ${PORT}`);
});
