FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY client/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY client/ ./

# Build the app
RUN npm run build

# Production image
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config
COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
