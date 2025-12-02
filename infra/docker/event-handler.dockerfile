FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY server/ ./

# Build TypeScript
RUN npm run build

CMD ["node", "dist/event-handler.js"]
