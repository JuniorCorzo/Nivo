#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

BOLD="\033[1m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo -e "${BOLD}${CYAN}========================================================================================${RESET}"
echo -e "${BOLD}${CYAN}                             STOPPING NIVO DEV ENVIRONMENT                              ${RESET}"
echo -e "${BOLD}${CYAN}========================================================================================${RESET}"

# 1. Stop background processes
echo -e "\n${BOLD}[1/3] Stopping background processes from .logs/*.pid...${RESET}"
if [ -d ".logs" ]; then
    shopt -s nullglob
    PID_FILES=(.logs/*.pid)
    shopt -u nullglob

    if [ ${#PID_FILES[@]} -eq 0 ]; then
        echo "  No active PID files found in .logs/."
    else
        for pid_file in "${PID_FILES[@]}"; do
            svc=$(basename "$pid_file" .pid)
            if [ -f "$pid_file" ]; then
                pid=$(cat "$pid_file" 2>/dev/null || true)
                if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
                    echo -n "  Stopping $svc (PID: $pid)... "
                    # Terminate children and main process
                    pkill -P "$pid" 2>/dev/null || true
                    kill "$pid" 2>/dev/null || true

                    for i in {1..6}; do
                        if kill -0 "$pid" 2>/dev/null; then
                            sleep 0.5
                        else
                            break
                        fi
                    done

                    # Force kill if still running after wait
                    if kill -0 "$pid" 2>/dev/null; then
                        pkill -9 -P "$pid" 2>/dev/null || true
                        kill -9 "$pid" 2>/dev/null || true
                    fi
                    echo -e "${GREEN}stopped${RESET}."
                else
                    echo "  Service $svc (PID: ${pid:-empty}) is not running."
                fi
                rm -f "$pid_file"
            fi
        done
    fi
else
    echo "  .logs directory does not exist."
fi

# 2. Stop Docker Compose dev stack
echo -e "\n${BOLD}[2/3] Stopping Docker Compose dev stack...${RESET}"
if [ -f "deployment/compose.dev.yaml" ]; then
    docker compose -f deployment/compose.dev.yaml down
else
    echo "  deployment/compose.dev.yaml not found."
fi

# 3. Verify and report port status
echo -e "\n${BOLD}[3/3] Checking port release status...${RESET}"

check_port_status() {
    local port=$1
    local name=$2
    if timeout 0.5 bash -c "cat < /dev/null > /dev/tcp/127.0.0.1/$port" 2>/dev/null; then
        echo -e "  • Port $port ($name): ${YELLOW}STILL IN USE${RESET}"
    else
        echo -e "  • Port $port ($name): ${GREEN}FREE${RESET}"
    fi
}

check_port_status 5432 "PostgreSQL Database"
check_port_status 9090 "Prometheus"
check_port_status 3000 "Grafana"
check_port_status 8080 "Backend API"
check_port_status 4200 "Frontend Web"
check_port_status 8085 "Mockups Suite"

echo -e "\n${BOLD}${GREEN}✔ All background processes and Docker services stopped.${RESET}\n"
