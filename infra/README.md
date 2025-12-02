# StakeVue Infrastructure

Docker-based infrastructure for local development and production deployment.

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │  Port 3000 (Nginx)
│  (React)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     API     │  Port 3001 (Express)
│   Server    │
└──────┬──────┘
       │
       ├──────────┐
       ▼          ▼
┌──────────┐  ┌──────────┐
│  Event   │  │  MySQL   │  Port 3306
│ Handler  │  │    DB    │
└──────────┘  └──────────┘
       │
       ▼
 [Casper Blockchain]
```

## 📦 Services

### 1. MySQL Database
- Image: `mysql:8.0.33`
- Port: `3306`
- Database: `stakevue`
- Volume: `mysql-data` (persistent storage)
- Health check enabled

### 2. DB Migrator
- Runs TypeORM migrations on startup
- Depends on healthy MySQL
- One-time initialization

### 3. API Server
- Express REST API
- Port: `3001`
- Proxies CSPR.cloud requests
- Serves stake and validator data

### 4. Event Handler
- WebSocket listener for blockchain events
- Indexes contract events to database
- Auto-reconnects on disconnect

### 5. Client (Frontend)
- React SPA served via Nginx
- Port: `3000`
- Production build with optimizations

## 🚀 Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Setup

1. **Copy environment file:**
```bash
cd infra/local
cp .env.example .env
```

2. **Edit `.env` with your credentials:**
```bash
# Your CSPR.cloud API key
CSPR_CLOUD_ACCESS_KEY=019a8d88-2cde-78ef-9cbd-d124f33adb0d

# Your smart contract hashes
CONTRACT_HASH=contract-xxxxx
CONTRACT_PACKAGE_HASH=hash-xxxxx

# CSPR.click credentials
CSPRCLICK_APP_ID=your-app-id
CSPRCLICK_APP_KEY=your-app-key
```

3. **Build and run:**
```bash
# From project root
make setup
make build-demo
make run-demo
```

### Access Services

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001
- **API Health:** http://localhost:3001/health
- **MySQL:** localhost:3306 (user: root, pass: password)

## 🛠️ Development

### View Logs

```bash
# All services
docker compose -f infra/local/docker-compose.yaml logs -f

# Specific service
docker compose -f infra/local/docker-compose.yaml logs -f api
docker compose -f infra/local/docker-compose.yaml logs -f handler
docker compose -f infra/local/docker-compose.yaml logs -f client
```

### Restart Service

```bash
docker compose -f infra/local/docker-compose.yaml restart api
```

### Rebuild Service

```bash
docker compose -f infra/local/docker-compose.yaml up -d --build api
```

### Access MySQL

```bash
docker exec -it stakevue-mysql mysql -uroot -ppassword stakevue
```

### Stop All Services

```bash
make stop-demo
```

### Clean Everything (including volumes)

```bash
make prune-demo
```

## 📝 Dockerfiles

### Client Dockerfile (`infra/docker/client.dockerfile`)
- Multi-stage build
- Stage 1: Build React app with Node
- Stage 2: Serve with Nginx
- Final image: ~30MB

### API Dockerfile (`infra/docker/api.dockerfile`)
- Single-stage build
- Install dependencies
- Build TypeScript
- Run compiled Node.js

### Event Handler Dockerfile (`infra/docker/event-handler.dockerfile`)
- Same as API dockerfile
- Different entry point (event-handler.js)

## 🔧 Configuration

### Environment Variables

All services use these environment variables:

**Server-side (API + Handler):**
- `DB_URI` - MySQL connection string
- `CSPR_CLOUD_URL` - CSPR.cloud API endpoint
- `CSPR_CLOUD_STREAMING_URL` - WebSocket endpoint
- `CSPR_CLOUD_ACCESS_KEY` - API access key
- `CONTRACT_HASH` - Smart contract hash
- `CONTRACT_PACKAGE_HASH` - Contract package hash

**Client-side:**
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_CONTRACT_HASH` - Contract hash
- `REACT_APP_CSPRCLICK_APP_ID` - CSPR.click app ID
- `REACT_APP_CSPRCLICK_APP_KEY` - CSPR.click key

### Network

All services run on the `stakevue-local` bridge network, allowing inter-container communication.

## 🐛 Troubleshooting

### MySQL connection failed
- Check if MySQL is healthy: `docker ps`
- View logs: `docker compose -f infra/local/docker-compose.yaml logs mysql`
- Wait for healthcheck to pass

### API can't connect to MySQL
- Ensure db-migrator completed successfully
- Check network: `docker network inspect stakevue-local`

### Event handler not receiving events
- Verify `CONTRACT_PACKAGE_HASH` is correct
- Check CSPR.cloud access key
- View logs for WebSocket errors

### Client can't connect to API
- Ensure API is running: http://localhost:3001/health
- Check browser console for CORS errors
- Verify `REACT_APP_API_URL` in build args

## 🚢 Production Deployment

For production, see deployment guides:
- Frontend: Deploy to Vercel/Netlify
- Backend: Deploy to Railway/Render
- Database: Use managed MySQL (PlanetScale, AWS RDS)

See main README for deployment instructions.
