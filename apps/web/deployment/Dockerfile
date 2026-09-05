# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM oven/bun:1.3.13-alpine AS builder

RUN apk add --no-cache nodejs

WORKDIR /workspace

# Copy dependency manifests
COPY package.json bun.lock ./
COPY libs/design-system/package.json ./libs/design-system/
COPY apps/web/package.json ./apps/web/

# Install workspace dependencies
RUN bun install --frozen-lockfile --ignore-scripts

# Copy source code
COPY libs/design-system ./libs/design-system
COPY apps/web ./apps/web

# Build design system library and web application
RUN bun run --cwd libs/design-system build && \
    bun run --cwd apps/web build

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

COPY apps/web/deployment/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/apps/web/dist/web/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -q -O- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
