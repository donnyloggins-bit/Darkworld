#!/bin/sh
# Writes config.js from Netlify environment variables at deploy time,
# so Supabase keys never live in the repo.
set -eu
if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_ANON_KEY:-}" ]; then
  printf "window.DW_CONFIG = { supabaseUrl: '%s', supabaseAnonKey: '%s', raidRequireGps: true };\n" \
    "$SUPABASE_URL" "$SUPABASE_ANON_KEY" > config.js
  echo "config.js written (online mode)"
else
  echo "window.DW_CONFIG = null;" > config.js
  echo "SUPABASE_URL / SUPABASE_ANON_KEY not set — config.js written in offline mode"
fi
