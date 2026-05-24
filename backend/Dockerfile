# ─── Stage 1: dependencies ───────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ─── Stage 2: test (used in CI) ──────────────────────────────────────────────
FROM node:20-alpine AS test
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm test -- --passWithNoTests

# ─── Stage 3: production image ───────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --chown=appuser:appgroup . .

USER appuser

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/health || exit 1

ENV NODE_ENV=production

CMD ["node", "server.js"]
