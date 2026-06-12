#!/usr/bin/env bash
# Simple helper to serve the current directory over HTTP for local testing.
# Usage: ./serve.sh
PORT=8000
echo "Serving . on http://localhost:$PORT — press Ctrl-C to stop"
python3 -m http.server $PORT
