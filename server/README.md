# StakeVue Server

Backend API and Event Listener for StakeVue Liquid Staking dApp.

## 🏗️ Architecture

- **API Server** (`src/api.ts`) - Express REST API with CSPR.cloud proxy
- **Event Listener** (`src/event-handler.ts`) - WebSocket listener for blockchain events
- **Database** - MySQL with TypeORM
- **Repositories** - Data access layer for Stake and Validator entities

## 📦 Components

### API Endpoints

- `GET /health` - Health check
- `GET /stakes/:account_hash` - Get user's stake history
- `GET /stakes` - Get recent stakes
- `GET /total-staked` - Get total value locked (TVL)
- `GET /user-staked/:account_hash` - Get user's total staked amount
- `GET /validators` - Get all validators
- `GET /validators/active` - Get active validators only
- `GET /accounts/:account_hash` - Proxy to CSPR.cloud

### Event Listener

Listens to blockchain events:
- `Stake` - User stakes CSPR
- `Unstake` - User unstakes stCSPR
- `Transfer` - User transfers stCSPR
- `ValidatorAdded` - Admin adds validator
- `ValidatorRemoved` - Admin removes validator

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+

### Installation

```bash
cd server
npm install
```

### Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `CSPR_CLOUD_ACCESS_KEY` - Your CSPR.cloud API key
- `CONTRACT_PACKAGE_HASH` - Your smart contract package hash
- `DB_URI` - MySQL connection string

### Run Development

```bash
# Run API server
npm run api:dev

# Run Event Listener (in another terminal)
npm run event-handler:dev
```

### Build

```bash
npm run build
```

## 🗄️ Database Schema

### Stake Entity

| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary key |
| userAccountHash | varchar(255) | User's account hash |
| actionType | enum | stake, unstake, or transfer |
| amount | varchar(255) | CSPR amount in motes |
| stCsprAmount | varchar(255) | stCSPR amount in motes |
| recipientAccountHash | varchar(255) | For transfer actions |
| txHash | varchar(255) | Transaction hash |
| blockHeight | bigint | Block height |
| timestamp | timestamp | Event timestamp |

### Validator Entity

| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary key |
| publicKey | varchar(255) | Validator public key |
| totalStaked | varchar(255) | Total CSPR staked |
| isActive | boolean | Active status |
| addedAt | timestamp | When added |

## 🛠️ Development

### Lint

```bash
npm run lint
npm run lint:fix
```

### Format

```bash
npm run format
```

## 🐳 Docker

The server can be run with Docker. See `infra/docker/` for Dockerfiles.

## 📝 Notes

- TypeORM is set to `synchronize: true` for development. Disable in production!
- Event listener automatically reconnects on WebSocket disconnect
- API proxies sensitive CSPR.cloud calls to protect API keys
