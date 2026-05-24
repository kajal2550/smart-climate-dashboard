# ═══════════════════════════════════════════════════════════════════════════════
#  Smart Climate Monitoring Dashboard — DevOps Makefile
#  Usage: make <target>
# ═══════════════════════════════════════════════════════════════════════════════

.PHONY: help dev dev-v2 prod down down-all jenkins jenkins-down \
        build build-backend build-frontend \
        test test-backend test-frontend lint \
        logs ps clean nuke

# ── Default target ─────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  Smart Climate Monitoring Dashboard — DevOps Commands"
	@echo "  ════════════════════════════════════════════════════"
	@echo ""
	@echo "  APPLICATION"
	@echo "  ─────────────────────────────────────────────────────"
	@echo "  make dev          Start dev stack (port 3000)"
	@echo "  make dev-v2       Start v2 stack  (port 3001)"
	@echo "  make prod         Start production stack (port 80)"
	@echo "  make down         Stop dev stack"
	@echo "  make down-all     Stop ALL stacks"
	@echo "  make ps           Show running containers"
	@echo "  make logs         Tail all logs"
	@echo ""
	@echo "  BUILD"
	@echo "  ─────────────────────────────────────────────────────"
	@echo "  make build        Build all Docker images"
	@echo "  make build-backend   Build backend image only"
	@echo "  make build-frontend  Build frontend image only"
	@echo ""
	@echo "  TESTING"
	@echo "  ─────────────────────────────────────────────────────"
	@echo "  make test         Run all tests"
	@echo "  make test-backend Run backend tests"
	@echo "  make test-frontend Run frontend tests"
	@echo "  make lint         Run linters"
	@echo ""
	@echo "  JENKINS CI/CD"
	@echo "  ─────────────────────────────────────────────────────"
	@echo "  make jenkins      Start Jenkins server (port 8080)"
	@echo "  make jenkins-down Stop Jenkins server"
	@echo "  make jenkins-pass Get Jenkins initial admin password"
	@echo ""
	@echo "  CLEANUP"
	@echo "  ─────────────────────────────────────────────────────"
	@echo "  make clean        Remove stopped containers + images"
	@echo "  make nuke         Remove EVERYTHING (volumes too)"
	@echo ""

# ── Application ────────────────────────────────────────────────────────────────

dev:
	@echo "🚀 Starting dev stack on port 3000..."
	docker compose up -d --build
	@echo "✅ App running at http://localhost:3000"
	@echo "   API running at http://localhost:5000"

dev-v2:
	@echo "🚀 Starting v2 stack on port 3001..."
	docker compose -f docker-compose.v2.yml up -d --build
	@echo "✅ App running at http://localhost:3001"

prod:
	@echo "🚀 Starting production stack on port 80..."
	@test -n "$(MONGO_ROOT_PASSWORD)" || (echo "❌ Set MONGO_ROOT_PASSWORD env var first" && exit 1)
	docker compose -f docker-compose.prod.yml up -d
	@echo "✅ Production app running at http://localhost:80"

down:
	@echo "🛑 Stopping dev stack..."
	docker compose down
	@echo "✅ Dev stack stopped"

down-all:
	@echo "🛑 Stopping ALL stacks..."
	docker compose down 2>/dev/null || true
	docker compose -f docker-compose.v2.yml down 2>/dev/null || true
	docker compose -f docker-compose.prod.yml down 2>/dev/null || true
	docker compose -f docker-compose.jenkins.yml down 2>/dev/null || true
	@echo "✅ All stacks stopped"

ps:
	@echo "📦 Running containers:"
	docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

# ── Build ──────────────────────────────────────────────────────────────────────

build:
	@echo "🐳 Building all Docker images..."
	docker compose build
	@echo "✅ All images built"

build-backend:
	@echo "🐳 Building backend image..."
	docker compose build backend
	@echo "✅ Backend image built"

build-frontend:
	@echo "🐳 Building frontend image..."
	docker compose build frontend
	@echo "✅ Frontend image built"

# ── Testing ────────────────────────────────────────────────────────────────────

test: test-backend test-frontend
	@echo "✅ All tests complete"

test-backend:
	@echo "🧪 Running backend tests..."
	cd backend && npm ci --silent && npm test
	@echo "✅ Backend tests complete"

test-frontend:
	@echo "🧪 Running frontend tests..."
	cd frontend && npm ci --silent && npm test -- --watchAll=false --passWithNoTests
	@echo "✅ Frontend tests complete"

lint:
	@echo "🔍 Running linters..."
	cd backend && npm ci --silent && npx eslint src/ --ext .js || true
	cd frontend && npm ci --silent && npx eslint src/ --ext .js,.jsx --max-warnings 100 || true
	@echo "✅ Lint complete"

# ── Jenkins ────────────────────────────────────────────────────────────────────

jenkins:
	@echo "🔧 Starting Jenkins CI/CD server..."
	docker compose -f docker-compose.jenkins.yml up -d
	@echo ""
	@echo "✅ Jenkins starting at http://localhost:8080"
	@echo "   Wait ~60 seconds for Jenkins to fully start"
	@echo "   Then run: make jenkins-pass"
	@echo ""

jenkins-down:
	@echo "🛑 Stopping Jenkins..."
	docker compose -f docker-compose.jenkins.yml down
	@echo "✅ Jenkins stopped"

jenkins-pass:
	@echo "🔑 Jenkins initial admin password:"
	@docker exec climate-jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null || \
		echo "Jenkins not running. Run: make jenkins"

jenkins-logs:
	docker compose -f docker-compose.jenkins.yml logs -f jenkins

# ── Cleanup ────────────────────────────────────────────────────────────────────

clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker system prune -f
	@echo "✅ Cleanup complete"

nuke:
	@echo "💥 Removing ALL Docker resources (containers, images, volumes)..."
	@read -p "Are you sure? This deletes ALL data! [y/N] " confirm && [ "$$confirm" = "y" ]
	docker compose down -v --remove-orphans 2>/dev/null || true
	docker compose -f docker-compose.v2.yml down -v --remove-orphans 2>/dev/null || true
	docker compose -f docker-compose.jenkins.yml down -v --remove-orphans 2>/dev/null || true
	docker system prune -af --volumes
	@echo "✅ Everything removed"

# ── Health checks ──────────────────────────────────────────────────────────────

health:
	@echo "🏥 Checking service health..."
	@curl -sf http://localhost:5000/health && echo "✅ Backend healthy" || echo "❌ Backend not responding"
	@curl -sf http://localhost:3000/ > /dev/null && echo "✅ Frontend healthy" || echo "❌ Frontend not responding"
	@curl -sf http://localhost:3001/ > /dev/null && echo "✅ Frontend v2 healthy" || echo "❌ Frontend v2 not responding"
