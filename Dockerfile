# Universal Agent Wallet - Production Docker Image

FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/sdk-core/package.json ./packages/sdk-core/

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build SDK first
WORKDIR /app/packages/sdk-core
RUN npm run build

# Build backend
WORKDIR /app/packages/backend
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV BACKEND_PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend

# Copy built application
COPY --from=builder --chown=backend:nodejs /app/packages/backend/dist ./dist
COPY --from=builder --chown=backend:nodejs /app/packages/backend/package.json ./package.json
COPY --from=deps --chown=backend:nodejs /app/packages/backend/node_modules ./node_modules

USER backend

EXPOSE 3000

ENV PORT=3000

CMD ["node", "dist/index.js"]
