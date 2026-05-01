# CI/CD Guide

This repository uses GitHub Actions for continuous integration, container image publishing, pull request validation, and dependency review.

## Workflow Files

- `.github/workflows/ci.yml`
- `.github/workflows/cd.yml`
- `.github/workflows/pr-checks.yml`
- `.github/workflows/dependency-updates.yml`

## CI Pipeline

File:

- `.github/workflows/ci.yml`

Triggers:

- push to `main`
- push to `develop`
- pull request to `main`
- pull request to `develop`

Behavior:

- detects changed paths first
- runs backend jobs only when `backend/**` changed
- runs frontend jobs only when `frontend/**` changed
- runs both when workflow files changed

Current CI jobs:

### Backend CI

- Node version: `20.x`
- installs backend dependencies with `npm ci`
- runs `npm test -- --passWithNoTests`

### Frontend CI

- Node version: `20.x`
- installs frontend dependencies with `npm ci`
- runs `npm run build`
- uploads the built frontend artifact

### Security Scan

- backend `npm audit`
- frontend `npm audit`
- Trivy filesystem scan
- SARIF upload to GitHub Security

### Code Quality

Current code-quality job is placeholder-style:

- installs backend and frontend dependencies
- emits pass messages for backend and frontend style checks

There is no actual lint script configured in either package at the moment.

## CD Pipeline

File:

- `.github/workflows/cd.yml`

Triggers:

- push to `main`
- manual `workflow_dispatch`

Current behavior:

- detects changed paths
- builds and pushes only the changed image
- uses Docker Buildx
- publishes to GHCR
- builds with `platforms: linux/amd64`

### Backend Image Job

- image: `ghcr.io/<repo>/backend`
- Dockerfile: `backend/Dockerfile`
- runtime image is tagged by branch, SHA, and `latest`
- cache is stored in `:buildcache`

Important:

- `:buildcache` is not deployable
- `:buildcache` exists only for build-layer reuse

### Frontend Image Job

- image: `ghcr.io/<repo>/frontend`
- Dockerfile: `frontend/Dockerfile`
- accepts `VITE_API_URL` as a build argument
- resolves `VITE_API_URL` from:
  - GitHub repository variable `VITE_API_URL`, if present
  - otherwise fallback `FRONTEND_API_URL` from the workflow file

## PR Checks

File:

- `.github/workflows/pr-checks.yml`

Triggers:

- pull request opened
- pull request synchronized
- pull request reopened

Current jobs:

- validate changed files and PR size
- basic sensitive-file check
- placeholder lint job
- backend test job
- frontend build job
- automatic PR labels via `actions/labeler`

Notes:

- the lint job does not run a real lint script yet
- the backend PR test job currently uses `npm test` with `continue-on-error: true`

## Dependency Review

File:

- `.github/workflows/dependency-updates.yml`

Triggers:

- every Monday at `09:00 UTC`
- manual `workflow_dispatch`

Current jobs:

- `npm outdated` for backend
- `npm outdated` for frontend
- backend `npm audit`
- frontend `npm audit`

## Required GitHub Configuration

Recommended repository configuration:

- package publishing allowed for GitHub Actions
- GitHub Actions enabled
- repository variable `VITE_API_URL` set to `/api` for Vercel-style proxy deployments

Example:

```text
VITE_API_URL=/api
```

## Release and Runtime Notes

- Backend requires Node `20+`
- Backend image must be `linux/amd64` for Azure Container Instances
- Frontend defaults to `/api` if `VITE_API_URL` is not set
- CD publishes images only; it does not currently perform the Azure deployment step

## What the Pipelines Do Not Yet Do

- no real lint execution
- no frontend unit test runner
- no automatic Azure deployment from GitHub Actions
- no secret manager integration in workflows

## Recommended Next Improvements

- add real lint scripts for backend and frontend
- make PR checks fail on backend test failures instead of continuing
- add frontend automated tests
- add a controlled deploy workflow for Azure Container Instances
- move the workflow-level frontend API fallback to a repository variable only
