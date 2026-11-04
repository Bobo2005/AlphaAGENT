FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy dependency manifests
COPY package*.json ./

# Install dependencies and global tsx runner
RUN npm install && npm install -g tsx

# Copy source code and data files
COPY src ./src
COPY data ./data
COPY tsconfig*.json ./

# Expose server port
EXPOSE 3000

# Start server
CMD ["npx", "tsx", "src/server.ts"]
