.PHONY: help setup build-demo run-demo stop-demo prune-demo build-client-docker build-api-docker build-event-handler-docker

help:
	@echo "StakeVue - Liquid Staking dApp"
	@echo ""
	@echo "Available commands:"
	@echo "  make setup                    - Copy .env.example to .env files"
	@echo "  make build-demo              - Build all Docker services"
	@echo "  make run-demo                - Run all services with Docker Compose"
	@echo "  make stop-demo               - Stop all running services"
	@echo "  make prune-demo              - Stop services and remove volumes"
	@echo "  make build-client-docker     - Build client Docker image"
	@echo "  make build-api-docker        - Build API Docker image"
	@echo "  make build-event-handler-docker - Build event handler Docker image"

setup:
	@echo "Setting up environment files..."
	@cp -n client/.env.example client/.env 2>/dev/null || echo "client/.env already exists"
	@cp -n server/.env.example server/.env 2>/dev/null || echo "server/.env already exists"
	@cp -n infra/local/.env.example infra/local/.env 2>/dev/null || echo "infra/local/.env already exists"
	@echo "✅ Setup complete! Edit .env files with your API keys."

build-client-docker:
	docker build -t stakevue-client -f infra/docker/client.dockerfile ./client

build-api-docker:
	docker build -t stakevue-api -f infra/docker/api.dockerfile ./server

build-event-handler-docker:
	docker build -t stakevue-event-handler -f infra/docker/event-handler.dockerfile ./server

build-demo:
	@echo "Building all services..."
	docker compose -f infra/local/docker-compose.yaml --project-name stakevue build

run-demo:
	@echo "Starting all services..."
	docker compose -f infra/local/docker-compose.yaml --project-name stakevue up -d
	@echo "✅ Services started!"
	@echo "   - Client: http://localhost:3000"
	@echo "   - API: http://localhost:3001"
	@echo "   - MySQL: localhost:3306"

stop-demo:
	@echo "Stopping all services..."
	docker compose -f infra/local/docker-compose.yaml --project-name stakevue down

prune-demo:
	@echo "Stopping services and removing volumes..."
	docker compose -f infra/local/docker-compose.yaml --project-name stakevue down -v
	@echo "✅ Cleanup complete!"
