# ==============================================================================
# Backend Dockerfile - Clean Architecture Node.js / TypeScript
# ==============================================================================

# Build Stage
FROM docker.io/library/node:22-bookworm-slim AS builder

WORKDIR /app

# Install build dependencies required for native node-gyp builds (e.g. better-sqlite3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install package dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Production Stage
FROM docker.io/library/node:22-bookworm-slim AS runner

WORKDIR /app

# Runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3001

# Copy package manifests and production dependencies only
COPY package*.json ./
RUN npm install --only=production

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# Create persistence data directory
RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "dist/index.js"]
