#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# ANSI Color Codes
BOLD="\033[1m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
DIM="\033[2m"
RESET="\033[0m"

echo -e "${BOLD}${CYAN}========================================================================================${RESET}"
echo -e "${BOLD}${CYAN}                             NIVO DEVELOPMENT ENVIRONMENT                               ${RESET}"
echo -e "${BOLD}${CYAN}========================================================================================${RESET}"

# Ensure logs directory exists
mkdir -p .logs

# 1. Start Docker Compose Stack (Database, Prometheus, Grafana)
echo -e "\n${BOLD}${BLUE}[1/4] Starting Docker infrastructure (Database, Prometheus, Grafana)...${RESET}"
docker compose -f deployment/compose.dev.yaml up -d

# Capture container IDs / Names
DB_CID=$(docker compose -f deployment/compose.dev.yaml ps -q database 2>/dev/null | cut -c1-12 || true)
DB_REF="nivo_dev_database"
if [ -n "$DB_CID" ]; then
    DB_REF="nivo_dev_database (${DB_CID})"
fi

PROM_CID=$(docker compose -f deployment/compose.dev.yaml ps -q prometheus 2>/dev/null | cut -c1-12 || true)
PROM_REF="nivo_dev_prometheus"
if [ -n "$PROM_CID" ]; then
    PROM_REF="nivo_dev_prometheus (${PROM_CID})"
fi

GRAF_CID=$(docker compose -f deployment/compose.dev.yaml ps -q grafana 2>/dev/null | cut -c1-12 || true)
GRAF_REF="nivo_dev_grafana"
if [ -n "$GRAF_CID" ]; then
    GRAF_REF="nivo_dev_grafana (${GRAF_CID})"
fi

# 2. Start Backend Spring Boot in background
echo -e "${BOLD}${BLUE}[2/4] Starting Backend API (Spring Boot)...${RESET}"
if [ -f .logs/api.pid ] && kill -0 "$(cat .logs/api.pid 2>/dev/null)" 2>/dev/null; then
    API_PID=$(cat .logs/api.pid)
    echo -e "      ${YELLOW}API already running with PID ${API_PID}${RESET}"
else
    (set -a; [ -f .env ] && . .env; [ -f deployment/.env ] && . deployment/.env; set +a; cd apps/api && ./gradlew bootRun) > .logs/api.log 2>&1 &
    API_PID=$!
    echo "$API_PID" > .logs/api.pid
    echo -e "      ${GREEN}API launched with PID ${API_PID}${RESET}"
fi

# 3. Start Frontend Web in background
echo -e "${BOLD}${BLUE}[3/4] Starting Frontend Web (Angular via Bun)...${RESET}"
if [ -f .logs/web.pid ] && kill -0 "$(cat .logs/web.pid 2>/dev/null)" 2>/dev/null; then
    WEB_PID=$(cat .logs/web.pid)
    echo -e "      ${YELLOW}Web already running with PID ${WEB_PID}${RESET}"
else
    bun run --cwd apps/web start > .logs/web.log 2>&1 &
    WEB_PID=$!
    echo "$WEB_PID" > .logs/web.pid
    echo -e "      ${GREEN}Web launched with PID ${WEB_PID}${RESET}"
fi

# 4. Start Mockups Suite (if mockups/dashboard exists)
MOCKUP_PID=""
if [ -d "mockups/dashboard" ]; then
    echo -e "${BOLD}${BLUE}[4/4] Starting Mockups Suite (Python HTTP Server)...${RESET}"
    if [ -f .logs/mockups.pid ] && kill -0 "$(cat .logs/mockups.pid 2>/dev/null)" 2>/dev/null; then
        MOCKUP_PID=$(cat .logs/mockups.pid)
        echo -e "      ${YELLOW}Mockups already running with PID ${MOCKUP_PID}${RESET}"
    else
        python3 -m http.server 8085 --directory mockups/dashboard > .logs/mockups.log 2>&1 &
        MOCKUP_PID=$!
        echo "$MOCKUP_PID" > .logs/mockups.pid
        echo -e "      ${GREEN}Mockups launched with PID ${MOCKUP_PID}${RESET}"
    fi
else
    echo -e "${DIM}[4/4] Directory mockups/dashboard not found; skipping mockups server.${RESET}"
fi

# Display Status Summary Table
echo -e "\n${BOLD}${GREEN}✔ All services launched successfully!${RESET}\n"

FORMAT="%-18s | %-12s | %-27s | %-6s | %-32s | %s\n"
SEPARATOR="-------------------+--------------+-----------------------------+--------+----------------------------------+------------------------------------------------------------"

echo -e "${BOLD}$SEPARATOR${RESET}"
printf "${BOLD}$FORMAT${RESET}" "SERVICE" "TYPE" "PID / CONTAINER" "PORT" "URL / HEALTH CHECK" "LOG COMMAND"
echo -e "${BOLD}$SEPARATOR${RESET}"
printf "$FORMAT" "Database (PostGIS)" "Docker" "$DB_REF" "5432" "localhost:5432 (pg_isready)" "docker compose -f deployment/compose.dev.yaml logs -f database"
printf "$FORMAT" "Prometheus" "Docker" "$PROM_REF" "9090" "http://localhost:9090/-/healthy" "docker compose -f deployment/compose.dev.yaml logs -f prometheus"
printf "$FORMAT" "Grafana" "Docker" "$GRAF_REF" "3000" "http://localhost:3000/api/health" "docker compose -f deployment/compose.dev.yaml logs -f grafana"
printf "$FORMAT" "API Backend" "Background" "PID: $API_PID" "8080" "http://localhost:8080/api" "tail -f .logs/api.log"
printf "$FORMAT" "Frontend Web" "Background" "PID: $WEB_PID" "4200" "http://localhost:4200" "tail -f .logs/web.log"
if [ -n "$MOCKUP_PID" ]; then
    printf "$FORMAT" "Mockups Suite" "Background" "PID: $MOCKUP_PID" "8085" "http://localhost:8085" "tail -f .logs/mockups.log"
fi
echo -e "${BOLD}$SEPARATOR${RESET}"

echo -e "\n${BOLD}${YELLOW}Quick Reference:${RESET}"
echo -e "  • Stop all services:      ${BOLD}${GREEN}./stop-dev.sh${RESET}  (or: ${CYAN}bun run dev:all:down${RESET})"
echo -e "  • View API logs:          ${CYAN}tail -f .logs/api.log${RESET}"
echo -e "  • View Web logs:          ${CYAN}tail -f .logs/web.log${RESET}"
if [ -n "$MOCKUP_PID" ]; then
    echo -e "  • View Mockups logs:      ${CYAN}tail -f .logs/mockups.log${RESET}"
fi
echo -e "  • View Docker logs:       ${CYAN}docker compose -f deployment/compose.dev.yaml logs -f${RESET}\n"
