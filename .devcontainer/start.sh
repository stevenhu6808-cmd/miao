#!/usr/bin/env bash
set -eu

log_file="/tmp/raid-nexus-vite.log"
url="http://127.0.0.1:8080/raidmate-community/"

if command -v curl >/dev/null 2>&1 && curl --silent --fail --max-time 2 "$url" >/dev/null 2>&1; then
	echo "Raid Nexus is already running on port 8080."
	exit 0
fi

if command -v lsof >/dev/null 2>&1 && lsof -iTCP:8080 -sTCP:LISTEN -nP >/dev/null 2>&1; then
	echo "Port 8080 is already in use; leaving the existing process running."
	exit 0
fi

nohup npm run dev:codespace >"$log_file" 2>&1 &
server_pid=$!

for attempt in $(seq 1 20); do
	if command -v curl >/dev/null 2>&1 && curl --silent --fail --max-time 2 "$url" >/dev/null 2>&1; then
		echo "Raid Nexus is ready on public port 8080 (PID $server_pid)."
		echo "Logs: $log_file"
		exit 0
	fi

	if ! kill -0 "$server_pid" 2>/dev/null; then
		echo "Raid Nexus failed to start. Check $log_file" >&2
		cat "$log_file" >&2 || true
		exit 1
	fi

	sleep 0.5
done

echo "Raid Nexus is still starting on public port 8080 (PID $server_pid)."
echo "Logs: $log_file"