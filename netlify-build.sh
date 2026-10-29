#!/bin/sh
# Writes config.js from Netlify environment variables at deploy time,
# so Supabase keys never live in the repo.
#   SUPABASE_URL + SUPABASE_ANON_KEY  → online mode (accounts, crews, raids)
#   CARTO_KEY                         → CARTO dark map tiles (optional)
#   FEEDBACK_URL                      → where "✉ SEND FEEDBACK" goes (optional; see config.example.js)
set -eu
CARTO="${CARTO_KEY:-}"
FEEDBACK="${FEEDBACK_URL:-}"
if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_ANON_KEY:-}" ]; then
  printf "window.DW_CONFIG = { supabaseUrl: '%s', supabaseAnonKey: '%s', raidRequireGps: true, cartoKey: '%s', feedbackUrl: '%s' };\n" \
    "$SUPABASE_URL" "$SUPABASE_ANON_KEY" "$CARTO" "$FEEDBACK" > config.js
  echo "config.js written (online mode)"
elif [ -n "$CARTO" ] || [ -n "$FEEDBACK" ]; then
  printf "window.DW_CONFIG = { cartoKey: '%s', feedbackUrl: '%s' };\n" "$CARTO" "$FEEDBACK" > config.js
  echo "SUPABASE_URL / SUPABASE_ANON_KEY not set — config.js written in offline mode (with map key / feedback link)"
else
  echo "window.DW_CONFIG = null;" > config.js
  echo "SUPABASE_URL / SUPABASE_ANON_KEY not set — config.js written in offline mode"
fi
