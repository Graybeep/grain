#!/usr/bin/env bash
# Deploy watchdog for the Docker + Cloudflare quick-tunnel setup. Prints one line only on change:
# public URL down/up, tunnel URL changed, or a new "→ cc" request in TASKS.md (local or origin/main).
#   bash scripts/watchdog.sh
cd "$(dirname "$0")/.." || exit 1
state=""; url=""
requests() { (cat TASKS.md; git show origin/main:TASKS.md 2>/dev/null) | grep -iE "(codex|human) *→ *cc" | sort -u; }
seen=$(requests)
while true; do
  cur=$(docker compose logs tunnel 2>/dev/null | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | tail -1)
  if [ -n "$cur" ] && [ "$cur" != "$url" ]; then
    [ -n "$url" ] && echo "TUNNEL URL CHANGED: $cur"
    url=$cur
  fi
  code=$(curl -s -o /dev/null -m 20 -w '%{http_code}' "$url/api/runs/golden" || true)
  if [ "$code" = 200 ]; then new=up; else new="down(http=${code:-none})"; fi
  if [ "$new" != "$state" ]; then
    { [ -n "$state" ] || [ "$new" != up ]; } && echo "PUBLIC URL $new: $url"
    state=$new
  fi
  git fetch -q 2>/dev/null || true
  reqs=$(requests)
  comm -13 <(echo "$seen") <(echo "$reqs") | sed 's/^/NEW REQUEST FOR CC: /'
  seen=$(printf "%s\n%s" "$seen" "$reqs" | sort -u)
  sleep 60
done
