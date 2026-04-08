# --- Stage 1: Base deps ---
FROM oven/bun:1-alpine AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# --- Stage 2: Development ---
FROM oven/bun:1-alpine AS dev
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD ["bun", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]

# --- Stage 3: Builder ---
FROM base AS builder
WORKDIR /app
COPY . .
RUN bun run build

# --- Stage 4: Production deps ---
FROM oven/bun:1-alpine AS prod-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# --- Stage 5: Production ---
FROM oven/bun:1-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
EXPOSE 3000
CMD ["bun", "run", "start"]
