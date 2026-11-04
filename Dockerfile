FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY tsconfig*.json ./
COPY src ./src
COPY data ./data

# Production runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev && npm install -g tsx

COPY --from=builder /app/src ./src
COPY --from=builder /app/data ./data
COPY --from=builder /app/tsconfig*.json ./

# Expose server port
EXPOSE 3000

# Start server
CMD ["npx", "tsx", "src/server.ts"]

