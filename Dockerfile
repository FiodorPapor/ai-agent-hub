# Universal Agent Wallet - Production Docker Image
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/sdk-core/package.json ./packages/sdk-core/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build SDK first
WORKDIR /app/packages/sdk-core
RUN pnpm run build

# Build backend
WORKDIR /app/packages/backend
RUN pnpm run build

# Copy playground UI
COPY packages/backend/playground-ui ./dist/playground-ui

# Set working directory back to backend
WORKDIR /app/packages/backend

# Environment variables
ENV NODE_ENV=production
ENV BACKEND_PORT=3000
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
