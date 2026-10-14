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
RED="\033[0;31m"
DIM="\033[2m"
RESET="\033[0m"

COMPOSE_FILE="deployment/compose.dev.yaml"
LOGS_DIR=".logs"

mkdir -p "$LOGS_DIR"

banner() {
    local title="${1:-NIVO DEVELOPMENT ENVIRONMENT}"
    echo -e "${BOLD}${CYAN}========================================================================================${RESET}"
    printf "${BOLD}${CYAN}%*s\n${RESET}" $(((${#title} + 88) / 2)) "$title"
    echo -e "${BOLD}${CYAN}========================================================================================${RESET}"
}

# --- Service Helper Functions ---

is_pid_running() {
    local pid_file="$1"
    if [ -f "$pid_file" ]; then
        local pid
        pid=$(cat "$pid_file" 2>/dev/null || true)
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            echo "$pid"
            return 0
        fi
    fi
    return 1
}

stop_process_by_pid_file() {
    local name="$1"
    local pid_file="$2"

    if [ -f "$pid_file" ]; then
        local pid
        pid=$(cat "$pid_file" 2>/dev/null || true)
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            echo -n "  Stopping $name (PID: $pid)... "
            pkill -P "$pid" 2>/dev/null || true
            kill "$pid" 2>/dev/null || true

            for _ in {1..6}; do
                if kill -0 "$pid" 2>/dev/null; then
                    sleep 0.5
                else
                    break
                fi
            done

            if kill -0 "$pid" 2>/dev/null; then
                pkill -9 -P "$pid" 2>/dev/null || true
                kill -9 "$pid" 2>/dev/null || true
            fi
            echo -e "${GREEN}stopped${RESET}."
        else
            echo -e "  Service $name is not running."
        fi
        rm -f "$pid_file"
    else
        echo -e "  Service $name is not running (no pidfile)."
    fi
}

check_port() {
    local port=$1
    local name=$2
    if timeout 0.5 bash -c "cat < /dev/null > /dev/tcp/127.0.0.1/$port" 2>/dev/null; then
        echo -e "  • Port $port ($name): ${YELLOW}IN USE${RESET}"
    else
        echo -e "  • Port $port ($name): ${GREEN}FREE${RESET}"
    fi
}

# --- Service: Database / Docker ---

start_db() {
    echo -e "\n${BOLD}${BLUE}==> Starting Docker infrastructure (Database, Prometheus, Grafana)...${RESET}"
    if [ -f "$COMPOSE_FILE" ]; then
        docker compose -f "$COMPOSE_FILE" up -d
        echo -e "    ${GREEN}✔ Docker stack active.${RESET}"
    else
        echo -e "    ${RED}Error: $COMPOSE_FILE not found!${RESET}"
        return 1
    fi
}

stop_db() {
    echo -e "\n${BOLD}${BLUE}==> Stopping Docker Compose infrastructure...${RESET}"
    if [ -f "$COMPOSE_FILE" ]; then
        docker compose -f "$COMPOSE_FILE" down
        echo -e "    ${GREEN}✔ Docker stack stopped.${RESET}"
    else
        echo -e "    ${YELLOW}Warning: $COMPOSE_FILE not found.${RESET}"
    fi
}

restart_db() {
    stop_db
    start_db
}

# --- Service: API (Spring Boot) ---

start_api() {
    echo -e "\n${BOLD}${BLUE}==> Starting Backend API (Spring Boot)...${RESET}"
    local running_pid
    if running_pid=$(is_pid_running "$LOGS_DIR/api.pid"); then
        echo -e "    ${YELLOW}API already running with PID ${running_pid}${RESET}"
    elif lsof -ti:8080 >/dev/null 2>&1; then
        local port_pid
        port_pid=$(lsof -ti:8080 2>/dev/null | head -n 1)
        echo "$port_pid" > "$LOGS_DIR/api.pid"
        echo -e "    ${YELLOW}API already running on port 8080 with PID ${port_pid}${RESET}"
    else
        (
            set -a
            [ -f .env ] && . .env
            [ -f deployment/.env ] && . deployment/.env
            set +a
            cd apps/api && exec ./gradlew bootRun
        ) > "$LOGS_DIR/api.log" 2>&1 &
        local api_pid=$!
        echo "$api_pid" > "$LOGS_DIR/api.pid"
        echo -e "    ${GREEN}✔ API launched with PID ${api_pid}${RESET} (Logs: ${CYAN}tail -f $LOGS_DIR/api.log${RESET})"
    fi
}

stop_api() {
    echo -e "\n${BOLD}${BLUE}==> Stopping Backend API...${RESET}"
    stop_process_by_pid_file "API Backend" "$LOGS_DIR/api.pid"
    local port_pids
    port_pids=$(lsof -ti:8080 2>/dev/null || true)
    if [ -n "$port_pids" ]; then
        echo -n "  Cleaning up process on port 8080... "
        kill -9 $port_pids 2>/dev/null || true
        echo -e "${GREEN}cleaned${RESET}."
    fi
}

restart_api() {
    stop_api
    start_api
}

# --- Service: Frontend Web (Angular) ---

start_web() {
    echo -e "\n${BOLD}${BLUE}==> Starting Frontend Web (Angular via Bun)...${RESET}"
    local running_pid
    if running_pid=$(is_pid_running "$LOGS_DIR/web.pid"); then
        echo -e "    ${YELLOW}Web already running with PID ${running_pid}${RESET}"
    elif lsof -ti:4200 >/dev/null 2>&1; then
        local port_pid
        port_pid=$(lsof -ti:4200 2>/dev/null | head -n 1)
        echo "$port_pid" > "$LOGS_DIR/web.pid"
        echo -e "    ${YELLOW}Web already running on port 4200 with PID ${port_pid}${RESET}"
    else
        ( cd apps/web && exec bun run start ) > "$LOGS_DIR/web.log" 2>&1 &
        local web_pid=$!
        echo "$web_pid" > "$LOGS_DIR/web.pid"
        echo -e "    ${GREEN}✔ Web launched with PID ${web_pid}${RESET} (Logs: ${CYAN}tail -f $LOGS_DIR/web.log${RESET})"
    fi
}

stop_web() {
    echo -e "\n${BOLD}${BLUE}==> Stopping Frontend Web...${RESET}"
    stop_process_by_pid_file "Frontend Web" "$LOGS_DIR/web.pid"
    local port_pids
    port_pids=$(lsof -ti:4200 2>/dev/null || true)
    if [ -n "$port_pids" ]; then
        echo -n "  Cleaning up process on port 4200... "
        kill -9 $port_pids 2>/dev/null || true
        echo -e "${GREEN}cleaned${RESET}."
    fi
}

restart_web() {
    stop_web
    start_web
}

# --- Service: Mockups Suite (Python HTTP) ---

start_mockups() {
    if [ -d "mockups/dashboard" ]; then
        echo -e "\n${BOLD}${BLUE}==> Starting Mockups Suite (Python HTTP Server)...${RESET}"
        local running_pid
        if running_pid=$(is_pid_running "$LOGS_DIR/mockups.pid"); then
            echo -e "    ${YELLOW}Mockups already running with PID ${running_pid}${RESET}"
        else
            python3 -m http.server 8085 --directory mockups/dashboard > "$LOGS_DIR/mockups.log" 2>&1 &
            local mockup_pid=$!
            echo "$mockup_pid" > "$LOGS_DIR/mockups.pid"
            echo -e "    ${GREEN}✔ Mockups launched with PID ${mockup_pid}${RESET} (Logs: ${CYAN}tail -f $LOGS_DIR/mockups.log${RESET})"
        fi
    fi
}

stop_mockups() {
    echo -e "\n${BOLD}${BLUE}==> Stopping Mockups Suite...${RESET}"
    stop_process_by_pid_file "Mockups Suite" "$LOGS_DIR/mockups.pid"
}

restart_mockups() {
    stop_mockups
    start_mockups
}

# --- Action: Status Table ---

status_services() {
    banner "NIVO SERVICES STATUS"

    local DB_CID PROM_CID GRAF_CID DB_REF PROM_REF GRAF_REF
    DB_CID=$(docker compose -f "$COMPOSE_FILE" ps -q database 2>/dev/null | cut -c1-12 || true)
    DB_REF="${RED}STOPPED${RESET}"
    [ -n "$DB_CID" ] && DB_REF="${GREEN}Docker ($DB_CID)${RESET}"

    PROM_CID=$(docker compose -f "$COMPOSE_FILE" ps -q prometheus 2>/dev/null | cut -c1-12 || true)
    PROM_REF="${RED}STOPPED${RESET}"
    [ -n "$PROM_CID" ] && PROM_REF="${GREEN}Docker ($PROM_CID)${RESET}"

    GRAF_CID=$(docker compose -f "$COMPOSE_FILE" ps -q grafana 2>/dev/null | cut -c1-12 || true)
    GRAF_REF="${RED}STOPPED${RESET}"
    [ -n "$GRAF_CID" ] && GRAF_REF="${GREEN}Docker ($GRAF_CID)${RESET}"

    local API_STATUS WEB_STATUS MOCK_STATUS
    local api_pid web_pid mock_pid

    if api_pid=$(is_pid_running "$LOGS_DIR/api.pid"); then
        API_STATUS="${GREEN}PID: $api_pid${RESET}"
    else
        local api_port_pid
        api_port_pid=$(lsof -ti:8080 2>/dev/null | head -n 1)
        if [ -n "$api_port_pid" ]; then
            API_STATUS="${GREEN}PID: $api_port_pid${RESET}"
            echo "$api_port_pid" > "$LOGS_DIR/api.pid"
        else
            API_STATUS="${RED}STOPPED${RESET}"
        fi
    fi

    if web_pid=$(is_pid_running "$LOGS_DIR/web.pid"); then
        WEB_STATUS="${GREEN}PID: $web_pid${RESET}"
    else
        local web_port_pid
        web_port_pid=$(lsof -ti:4200 2>/dev/null | head -n 1)
        if [ -n "$web_port_pid" ]; then
            WEB_STATUS="${GREEN}PID: $web_port_pid${RESET}"
            echo "$web_port_pid" > "$LOGS_DIR/web.pid"
        else
            WEB_STATUS="${RED}STOPPED${RESET}"
        fi
    fi

    if mock_pid=$(is_pid_running "$LOGS_DIR/mockups.pid"); then
        MOCK_STATUS="${GREEN}PID: $mock_pid${RESET}"
    else
        MOCK_STATUS="${RED}STOPPED${RESET}"
    fi

    FORMAT="%-18s | %-32b | %-6s | %-32s | %s\n"
    SEPARATOR="-------------------+----------------------------------+--------+----------------------------------+------------------------------------------------------------"

    echo -e "\n${BOLD}$SEPARATOR${RESET}"
    printf "${BOLD}%-18s | %-22s | %-6s | %-32s | %s${RESET}\n" "SERVICE" "STATUS / CONTAINER" "PORT" "URL / HEALTH CHECK" "LOG COMMAND"
    echo -e "${BOLD}$SEPARATOR${RESET}"
    printf "$FORMAT" "Database (PostGIS)" "$DB_REF" "5432" "localhost:5432 (pg_isready)" "docker compose -f $COMPOSE_FILE logs -f database"
    printf "$FORMAT" "Prometheus" "$PROM_REF" "9090" "http://localhost:9090/-/healthy" "docker compose -f $COMPOSE_FILE logs -f prometheus"
    printf "$FORMAT" "Grafana" "$GRAF_REF" "3000" "http://localhost:3000/api/health" "docker compose -f $COMPOSE_FILE logs -f grafana"
    printf "$FORMAT" "API Backend" "$API_STATUS" "8080" "http://localhost:8080/api" "tail -f $LOGS_DIR/api.log"
    printf "$FORMAT" "Frontend Web" "$WEB_STATUS" "4200" "http://localhost:4200" "tail -f $LOGS_DIR/web.log"
    if [ -d "mockups/dashboard" ]; then
        printf "$FORMAT" "Mockups Suite" "$MOCK_STATUS" "8085" "http://localhost:8085" "tail -f $LOGS_DIR/mockups.log"
    fi
    echo -e "${BOLD}$SEPARATOR${RESET}\n"
}

# --- Action: Tail Logs ---

tail_logs() {
    local target="$1"
    case "$target" in
        api|backend)
            tail -f "$LOGS_DIR/api.log"
            ;;
        web|frontend)
            tail -f "$LOGS_DIR/web.log"
            ;;
        mockups|mockup)
            tail -f "$LOGS_DIR/mockups.log"
            ;;
        db|database|infra|docker)
            docker compose -f "$COMPOSE_FILE" logs -f
            ;;
        *)
            echo -e "${YELLOW}Usage: ./dev.sh logs [api|web|db|mockups]${RESET}"
            ;;
    esac
}

# --- Help ---

show_help() {
    banner "NIVO DEV CLI HELP"
    echo -e "\n${BOLD}Uso:${RESET} ./dev.sh [COMANDO] [SERVICIO]\n"
    echo -e "${BOLD}Comandos:${RESET}"
    echo -e "  ${CYAN}start${RESET}   [servicio]   Inicia todos los servicios o uno específico (default si no se pasa comando)"
    echo -e "  ${CYAN}stop${RESET}    [servicio]   Detiene todos los servicios o uno específico"
    echo -e "  ${CYAN}restart${RESET} [servicio]   Reinicia todos los servicios o uno específico"
    echo -e "  ${CYAN}status${RESET}               Muestra la tabla de estado en vivo de los servicios y puertos"
    echo -e "  ${CYAN}logs${RESET}    <servicio>   Muestra el log en vivo del servicio (api, web, db, mockups)"
    echo -e "  ${CYAN}help${RESET}                 Muestra esta ayuda\n"
    echo -e "${BOLD}Servicios disponibles:${RESET}"
    echo -e "  ${GREEN}all${RESET}                  Todos los servicios (por defecto)"
    echo -e "  ${GREEN}api${RESET} | ${GREEN}backend${RESET}          Backend Spring Boot API (:8080)"
    echo -e "  ${GREEN}web${RESET} | ${GREEN}frontend${RESET}         Frontend Angular App (:4200)"
    echo -e "  ${GREEN}db${RESET}  | ${GREEN}database${RESET} | ${GREEN}infra${RESET}  Docker PostgreSQL, Prometheus, Grafana (:5432, :9090, :3000)"
    echo -e "  ${GREEN}mockups${RESET}              Servidor HTTP de prototipos (:8085)\n"
    echo -e "${BOLD}Ejemplos:${RESET}"
    echo -e "  ./dev.sh                     # Inicia todo el stack"
    echo -e "  ./dev.sh restart api         # Reinicia solo el backend"
    echo -e "  ./dev.sh restart web         # Reinicia solo el frontend"
    echo -e "  ./dev.sh stop db             # Apaga solo la base de datos"
    echo -e "  ./dev.sh logs api            # Sigue los logs del backend en vivo"
    echo -e "  ./dev.sh status              # Verifica estado y puertos\n"
}

# --- Main Dispatcher ---

COMMAND="${1:-start}"
SERVICE="${2:-all}"

# Si el primer argumento es un servicio sin comando (ej: ./dev.sh api), interpretar como start api
if [[ "$COMMAND" =~ ^(api|backend|web|frontend|db|database|infra|docker|mockups|mockup)$ ]]; then
    SERVICE="$COMMAND"
    COMMAND="start"
fi

case "$COMMAND" in
    start)
        banner "STARTING NIVO SERVICES"
        case "$SERVICE" in
            all)
                start_db
                start_api
                start_web
                start_mockups
                status_services
                ;;
            db|database|infra|docker)
                start_db
                ;;
            api|backend)
                start_api
                ;;
            web|frontend)
                start_web
                ;;
            mockups|mockup)
                start_mockups
                ;;
            *)
                echo -e "${RED}Servicio desconocido: '$SERVICE'. Usa './dev.sh help'.${RESET}"
                exit 1
                ;;
        esac
        ;;

    stop)
        banner "STOPPING NIVO SERVICES"
        case "$SERVICE" in
            all)
                stop_mockups
                stop_web
                stop_api
                stop_db
                echo -e "\n${BOLD}${BLUE}==> Checking port release status...${RESET}"
                check_port 5432 "PostgreSQL Database"
                check_port 9090 "Prometheus"
                check_port 3000 "Grafana"
                check_port 8080 "Backend API"
                check_port 4200 "Frontend Web"
                check_port 8085 "Mockups Suite"
                echo -e "\n${BOLD}${GREEN}✔ All requested services stopped.${RESET}\n"
                ;;
            db|database|infra|docker)
                stop_db
                check_port 5432 "PostgreSQL Database"
                ;;
            api|backend)
                stop_api
                check_port 8080 "Backend API"
                ;;
            web|frontend)
                stop_web
                check_port 4200 "Frontend Web"
                ;;
            mockups|mockup)
                stop_mockups
                check_port 8085 "Mockups Suite"
                ;;
            *)
                echo -e "${RED}Servicio desconocido: '$SERVICE'. Usa './dev.sh help'.${RESET}"
                exit 1
                ;;
        esac
        ;;

    restart)
        banner "RESTARTING NIVO SERVICES"
        case "$SERVICE" in
            all)
                stop_mockups
                stop_web
                stop_api
                stop_db
                sleep 1
                start_db
                start_api
                start_web
                start_mockups
                status_services
                ;;
            db|database|infra|docker)
                restart_db
                ;;
            api|backend)
                restart_api
                ;;
            web|frontend)
                restart_web
                ;;
            mockups|mockup)
                restart_mockups
                ;;
            *)
                echo -e "${RED}Servicio desconocido: '$SERVICE'. Usa './dev.sh help'.${RESET}"
                exit 1
                ;;
        esac
        ;;

    status)
        status_services
        ;;

    logs)
        tail_logs "$SERVICE"
        ;;

    help|-h|--help)
        show_help
        ;;

    *)
        echo -e "${RED}Comando desconocido: '$COMMAND'${RESET}"
        show_help
        exit 1
        ;;
esac
