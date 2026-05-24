# ─── Stage 1: Build React app ─────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# ─── Stage 2: Serve with Nginx ────────────────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Copy built assets
COPY --from=builder --chown=nginx:nginx /app/build /usr/share/nginx/html

# Copy nginx template (uses envsubst for BACKEND_HOST / BACKEND_PORT)
COPY --chown=nginx:nginx nginx.conf /etc/nginx/templates/default.conf.template

# Default backend values (overridable via env at runtime)
ENV BACKEND_HOST=backend
ENV BACKEND_PORT=5000

# Non-root user setup
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid && \
    mkdir -p /etc/nginx/conf.d && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /etc/nginx/templates

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
