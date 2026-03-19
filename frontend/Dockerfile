FROM node:20-alpine AS base

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

FROM base AS dev
CMD ["pnpm", "dev"]

FROM base AS builder
RUN pnpm build

FROM node:20-alpine AS prod
RUN corepack enable pnpm
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
CMD ["node", "server.js"]
