#!/usr/bin/env bash
set -eu

log_file="/tmp/raid-nexus-vite.log"

if (command -v curl >/dev/null 2>&1 && curl --silent --fail --max-time 2 http://127.0.0.1:8080/raidmate-community/ >/dev/null 2>&1) ||
  (command -v lsof >/dev/null 2>&1 && lsof -iTCP:8080 -sTCP:LISTEN -nP >/dev/null 2>&1); then
  exit 0
fi

nohup npm run dev:codespace >"$log_file" 2>&1 &
server_pid=$!
sleep 1
if ! kill -0 "$server_pid" 2>/dev/null; then
  echo "Raid Nexus failed to start. Check $log_file" >&2
  exit 1
fi
echo "Raid Nexus is starting on public port 8080 (PID $server_pid). Logs: $log_file"