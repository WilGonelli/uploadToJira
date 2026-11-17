# ==============================================================================
# Frontend Dockerfile - React + Vite + TypeScript (MVVM)
# ==============================================================================

# Build Stage
FROM docker.io/library/node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig*.json vite.config.ts index.html ./
COPY public/ ./public/
COPY src/ ./src/

RUN npm run build

# Production Stage - Nginx Web Server
FROM docker.io/library/nginx:alpine AS runner

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
