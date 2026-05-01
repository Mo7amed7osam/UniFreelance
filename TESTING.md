# Testing Guide

This repository currently has partial automated test coverage. This guide documents what exists today and how contributors should validate changes.

## Current Test Reality

Backend:

- test runner: Jest
- package script: `npm test`

Frontend:

- no automated unit test runner is configured
- current automated validation is `npm run build`

CI:

- backend CI runs `npm test -- --passWithNoTests`
- frontend CI runs `npm run build`

## Recommended Validation by Change Type

### Backend Changes

Run:

```bash
cd backend
npm ci
npm test -- --passWithNoTests
```

Then smoke-test the API:

```bash
curl http://localhost:5000/health
curl http://localhost:5000/metrics
```

### Frontend Changes

Run:

```bash
cd frontend
npm ci
npm run build
```

For local dev:

```bash
npm run dev
```

Then verify the main flows manually in the browser.

### Docker or Deployment Changes

Run:

```bash
docker compose config
docker compose -f docker-compose.monitoring.yml config
```

If backend image behavior changed:

```bash
docker build -t unifreelance-backend:test ./backend
docker run --rm -p 5000:5000 \
  -e PORT=5000 \
  -e MONGO_URI='your-mongo-uri' \
  -e JWT_SECRET='test-secret' \
  unifreelance-backend:test
```

If frontend image behavior changed:

```bash
docker build -t unifreelance-frontend:test ./frontend
docker run --rm -p 8080:80 unifreelance-frontend:test
```

## Manual Smoke Test Checklist

Backend:

- `/health` returns `200`
- `/metrics` returns Prometheus metrics
- MongoDB connection succeeds on boot
- authentication endpoints still respond

Frontend:

- app loads without a white screen
- API requests resolve against `/api`
- protected and public routes still render
- form submission flows still work

Monitoring:

- Prometheus is ready
- Grafana dashboard loads
- blackbox probes are green

## Adding Tests

If you add backend tests, keep them aligned with Jest.

Suggested areas:

- controllers
- route handlers
- services
- utility functions

If you add frontend tests, document the chosen test runner in this file and update CI to execute it.

## Known Gaps

- no frontend unit tests
- no E2E tests
- backend tests may currently pass with no test files present
- no dedicated load or performance test workflow

## Minimum Merge Standard

At a minimum, a change should satisfy the checks that match its scope:

- backend change: backend test command and API smoke test
- frontend change: frontend build and manual browser check
- Docker or ops change: compose config validation and container smoke test
