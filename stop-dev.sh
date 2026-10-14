#!/usr/bin/env bash
# Legacy wrapper: delegating to unified dev.sh
if [ "$1" = "help" ] || [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    exec "$(dirname "$0")/dev.sh" help
else
    exec "$(dirname "$0")/dev.sh" stop "$@"
fi
