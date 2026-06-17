#!/usr/bin/env bash
# Refresh the Basecamp 2 OAuth access token and write it back to basecamp.env.
# Usage: ./.cursor/refresh-basecamp-token.sh
set -euo pipefail

ENV_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/basecamp.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: $ENV_FILE not found" >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

for v in BASECAMP_CLIENT_ID BASECAMP_CLIENT_SECRET BASECAMP_REFRESH_TOKEN BASECAMP_USER_AGENT; do
  if [[ -z "${!v:-}" ]]; then
    echo "error: $v missing in $ENV_FILE" >&2
    exit 1
  fi
done

resp="$(curl -s -X POST "https://launchpad.37signals.com/authorization/token?type=refresh&refresh_token=${BASECAMP_REFRESH_TOKEN}&client_id=${BASECAMP_CLIENT_ID}&client_secret=${BASECAMP_CLIENT_SECRET}" -H "User-Agent: ${BASECAMP_USER_AGENT}")"

access_token="$(printf '%s' "$resp" | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')"

if [[ -z "$access_token" ]]; then
  echo "error: failed to obtain access_token. Response:" >&2
  echo "$resp" >&2
  exit 1
fi

# Replace the BASECAMP_TOKEN line in place (portable for macOS + Linux).
tmp="$(mktemp)"
awk -v tok="$access_token" '
  /^BASECAMP_TOKEN=/ { print "BASECAMP_TOKEN=" tok; next }
  { print }
' "$ENV_FILE" > "$tmp" && mv "$tmp" "$ENV_FILE"

echo "Basecamp token refreshed. New expiry:"
# Decode the embedded expires_at for confirmation (best-effort).
printf '%s' "$access_token" | cut -d'-' -f1 | base64 -d 2>/dev/null | LC_ALL=C tr -cd '[:print:]' | sed -n 's/.*"expires_at":"\([^"]*\)".*/  \1/p' || true
