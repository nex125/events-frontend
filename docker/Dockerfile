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
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# --- Stage 4: Production ---
FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
