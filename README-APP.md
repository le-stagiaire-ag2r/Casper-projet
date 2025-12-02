# 💎 StakeVue - Full Stack Liquid Staking dApp

**Complete application with React frontend, Node.js backend, and Rust smart contract.**

Built for **Casper Hackathon 2026**.

---

## 🚀 Quick Start (Docker)

```bash
# 1. Clone
git clone https://github.com/le-stagiaire-ag2r/Casper-projet.git
cd Casper-projet

# 2. Setup (copies .env files)
make setup

# 3. Edit infra/local/.env with your keys
nano infra/local/.env

# 4. Build & Run
make build-demo
make run-demo
```

**Access:**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- MySQL: localhost:3306

---

## 📦 Architecture

Full-stack monorepo with:

- **Client** (React + TypeScript + CSPR.click)
- **Server** (Express + TypeORM + MySQL)
- **Event Listener** (WebSocket → Blockchain)
- **Smart Contract** (Rust/WASM on Casper)

See main [README.md](./README.md) for smart contract details.

---

## 📚 Documentation

- [Client README](./client/README.md)
- [Server README](./server/README.md)
- [Infrastructure README](./infra/README.md)
- [Smart Contract (main README)](./README.md)

---

## 🛠️ Makefile Commands

```bash
make setup       # Copy .env.example files
make build-demo  # Build Docker images
make run-demo    # Start all services
make stop-demo   # Stop services
make prune-demo  # Stop + remove volumes
```

---

**Built with ❤️ for Casper Hackathon 2026**
