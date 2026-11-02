# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@12.16.1 --activate

WORKDIR /workspace

# Copy dependency manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY libs/design-system/package.json ./libs/design-system/
COPY apps/web/package.json ./apps/web/

# Install workspace dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY libs/design-system ./libs/design-system
COPY apps/web ./apps/web

# Build design system library and web application
RUN pnpm --filter @nivo-sass/design-system build && \
    pnpm --filter web build

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

COPY apps/web/deployment/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/apps/web/dist/web/browser /usr/share/nginx/html

RUN apk add --no-cache libcap && \
    setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /etc/nginx/conf.d /usr/share/nginx/html

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -q -O- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
