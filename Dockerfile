# Multi-stage production Dockerfile for FITSYNC Global Deployment
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3 native compilation
RUN apk add --no-cache python3 make g++ gcc

# Copy root and package descriptors
COPY package.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm --prefix server ci
RUN npm --prefix client ci

# Copy source code
COPY server ./server
COPY client ./client

# Build both frontend and backend
RUN npm --prefix client run build
RUN npm --prefix server run build

# Remove development dependencies from server
RUN npm --prefix server prune --production

# ─── Final Production Runner ───
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy compiled assets from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/client/dist ./client/dist

# Create persistent directories for SQLite database and uploads
RUN mkdir -p /app/server/data /app/server/uploads

EXPOSE 3001

CMD ["node", "server/dist/index.js"]
