Ascendra — Single-file release
=============================

Quick start
-----------

To run Ascendra locally (recommended so embedded videos work reliably):

1. Open a terminal in the project folder (the directory that contains `Ascendra.html`).
2. Run a tiny HTTP server, for example with Python 3:

```bash
python -m http.server 8000
# then open http://localhost:8000/Ascendra.html in your browser
```

Alternatively, execute the included helper script on Unix-like systems:

```bash
chmod +x serve.sh
./serve.sh
```

Why serve it?
- Browsers restrict certain iframe/embed behaviors when opening HTML files with the `file://` protocol. Serving the file over HTTP avoids those limitations and makes YouTube/Vimeo embeds, autoplay, and some browser features work more consistently.

Data backup & restore
---------------------

- Open `Settings → Your data`.
- Click **Export data** to download a JSON backup of your local state.
- Click **Import data** to paste a previously exported JSON file (import replaces local data after confirmation).

Note: Export first before importing if you want a safe restore point.

Testing checklist
-----------------

- Start a local server and open `Ascendra.html` in your browser.
- Go to `Motivation` and tap a clip — it should open in an in-app modal and play (if the video is available).
- Open the `Urge` toolbox and try `Watch this` to trigger a random motivating clip.
- Export your data, then Import it back to confirm the flow works and UI updates.

Troubleshooting
---------------

- If embeds still do not load, try a different browser or check extensions/privacy settings blocking third-party content.
- If you see a banner about `file://`, follow the command it offers to run a local server.

About the coach
---------------

The in-app coach is rule-based in this single-file release and provides scripted empathetic responses and shortcuts (e.g., typing "motivation" opens the Motivation view). For multilingual/LLM-backed behavior, a secure server-side proxy and API key would be required — this is intentionally not included in the single-file version to avoid exposing secrets.

Remote LLM coach (privacy)
--------------------------

If you self-host the optional LLM proxy server, the client can send messages to it to receive multilingual, empathetic responses. This must be explicitly enabled in `Settings → Coach server` by turning on **Enable remote coach** and entering your server URL (and optional secret). Messages are transmitted only after you enable consent.

Do not enable the remote coach if you do not trust the server operator. The server stores the OpenAI API key and performs the LLM calls — keep it secure and monitor usage.

Status
------
This release includes: curated motivational videos, an in-app modal player, export/import of local state, and a file:// banner with instructions to serve the app locally.

If you'd like, I can:
- Add a tiny `serve.sh` helper script to launch a Python server.
- Scaffold a secure server-side LLM proxy (requires API key and hosting).

Enjoy — and let me know which next step you'd like.
# Ascendra — Single-file web app

This repository contains a single-file web application: `Ascendra.html`.

Open `Ascendra.html` in any modern browser to run the app locally. It is fully client-side and stores data in your browser's `localStorage`.

Key features included in this single-file release:
- Motivation panel with curated videos that play inside the app
- An editable video manager (Settings) to add, edit, and remove motivational videos
- AI coach UI with quick commands and humanized responses (local, no external LLM)
- Sessions, streaks, and a small recovery community view with a configurable display cap
- Accessibility and performance improvements (modal focus handling, aria-hidden, lazy-loading)

If you want a server-backed version (optional), there is a simple scaffold in `server/` you can use as a starting point — it is not required to run the client.

To publish the app, host `Ascendra.html` on any static hosting provider (GitHub Pages, Netlify, Vercel) or open it locally in a browser.

If you want me to remove the optional `server/` scaffold files and finalize a clean single-file release (zip + README), tell me and I'll do that next.
# Ascendra — Minimal server scaffold

This repository contains the single-file client `Ascendra.html` and a minimal optional backend under `server/` that provides:

- Videos REST API (`GET/POST/PUT/DELETE /videos`)
- Community join endpoint (`POST /community/join`) and members (`GET /community/members/:groupId`)
- Health check (`GET /health`)
- Optional LLM proxy (`POST /llm`) if `OPENAI_API_KEY` is provided (proxy to OpenAI Chat Completions)

Quick start (Linux):

```bash
# from repo root
cd server
npm install
# set env vars in .env or export them
# e.g. create a .env with:
# PORT=5080
# COMMUNITY_CAP=10
# OPENAI_API_KEY=sk-...
node index.js
```

Server will run on `http://localhost:5080` by default.

Client usage:

- The existing `Ascendra.html` is a client-only SPA that uses localStorage. To make it use the server, you can modify the client to call the API endpoints at `http://localhost:5080` for videos and community actions. The server is optional — the client will continue to work without it.

Notes and next steps:

- For production, host the server behind TLS, set secure environment variables, and consider authentication for community actions.
- The LLM proxy is a thin pass-through; consider adding request size and rate limiting and an authentication layer before enabling it publicly.
