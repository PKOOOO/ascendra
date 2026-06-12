# Ascendra LLM Proxy (Server)

This small Express server provides a secure proxy endpoint for the Ascendra web app to call an LLM (OpenAI). It keeps API keys off the client and adds basic rate limiting and CORS restrictions.

Important: Do NOT commit your real API key. Use the `.env` file (copy `.env.example`).

Setup
-----

1. Copy the example .env and fill values:

```bash
cp .env.example .env
# Edit .env and set OPENAI_API_KEY and (optionally) COACH_API_SECRET
```

2. Install deps and run:

```bash
cd server
npm install
npm start
# or for development:
npm run dev
```

Security notes
--------------
- The server uses `COACH_API_SECRET` (optional). If set, the client must include the same value in header `x-api-secret` for requests.
- The server restricts origins via `ALLOWED_ORIGINS` (defaults to `http://localhost:8000`). Adjust for your deployment.
- Rate limiting is enabled to reduce misuse.

Endpoint
--------
- POST `/api/coach`
  - Body: `{ message: string, sessionId?: string }`
  - Headers: optional `x-api-secret` if `COACH_API_SECRET` is set
  - Response: `{ reply: string, model: string }`

Production considerations
-------------------------
- Use HTTPS and host behind a proper reverse proxy (NGINX or managed hosting).
- Add authentication and ACLs if you plan to deploy publicly.
- Monitor usage and billing on your LLM provider.
- For more advanced needs (multilingual models, prompt engineering, safety filters), add server-side moderation checks and language detection.
