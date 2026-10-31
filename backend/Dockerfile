# ─── Stage 1: Build Stage ─────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install system dependencies needed for Prisma
RUN apk add --no-cache openssl

# Copy package manifests and Prisma schema (needed for postinstall script)
COPY package*.json ./
COPY prisma ./prisma

# Install all dependencies (automatically triggers npm postinstall: prisma generate)
RUN npm ci

# Copy source code and build config
COPY tsconfig*.json ./
COPY src ./src

# Compile TypeScript to JavaScript
RUN npm run build

# Prune devDependencies to keep only production dependencies
RUN npm prune --omit=dev

# ─── Stage 2: Production Runner ───────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=4000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 taskhub

# Create uploads directory with appropriate permissions
RUN mkdir -p /app/uploads && chown -R taskhub:nodejs /app/uploads

# Copy production node_modules and compiled output
COPY --from=builder --chown=taskhub:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=taskhub:nodejs /app/dist ./dist
COPY --from=builder --chown=taskhub:nodejs /app/prisma ./prisma
COPY --from=builder --chown=taskhub:nodejs /app/package.json ./package.json

USER taskhub

EXPOSE 4000

CMD ["node", "dist/server.js"]