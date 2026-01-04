# CI/CD Pipeline Overview

This document provides an overview of the automated CI/CD pipeline implemented for UniFreelance.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
│                  (Push / Pull Request)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   GitHub Actions Workflows                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   CI Pipeline │  │  PR Checks   │  │   Security   │      │
│  │   (ci.yml)    │  │(pr-checks.yml)│ │   Scanning   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         ▼                  ▼                  ▼               │
│  ┌────────────────────────────────────────────────┐         │
│  │  • Build & Test Backend (Node 18.x, 20.x)     │         │
│  │  • Build Frontend (Node 18.x, 20.x)           │         │
│  │  • Lint & Code Quality Checks                 │         │
│  │  • Security Audits (npm audit, Trivy)         │         │
│  │  • Upload Artifacts                            │         │
│  └────────────────────────────────────────────────┘         │
│                                                               │
│  ┌──────────────────────────────────────────────┐           │
│  │         CD Pipeline (cd.yml)                  │           │
│  │        (Triggered on push to main)            │           │
│  └──────────────────┬───────────────────────────┘           │
│                     │                                         │
└─────────────────────┼─────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub Container Registry (ghcr.io)             │
├─────────────────────────────────────────────────────────────┤
│  • Backend Docker Image (tagged: latest, branch, sha)       │
│  • Frontend Docker Image (tagged: latest, branch, sha)      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Target                         │
│  • Docker Compose (Local/Server)                            │
│  • Kubernetes Cluster                                        │
│  • Cloud Platform (AWS ECS, GCP Cloud Run, Azure, etc.)     │
└─────────────────────────────────────────────────────────────┘
```

## Workflows

### 1. CI Pipeline (`ci.yml`)

**Trigger:** Push or Pull Request to `main` or `develop` branches

**Jobs:**

#### Backend CI
- **Matrix Strategy:** Node.js 18.x and 20.x
- **Steps:**
  1. Checkout code
  2. Setup Node.js environment
  3. Install dependencies (npm ci)
  4. Run tests (npm test)
  5. Validate build

#### Frontend CI
- **Matrix Strategy:** Node.js 18.x and 20.x
- **Steps:**
  1. Checkout code
  2. Setup Node.js environment
  3. Install dependencies (npm ci)
  4. Build production bundle (npm run build)
  5. Upload build artifacts (Node 20.x only)

#### Security Scan
- **Steps:**
  1. Run npm audit on backend (moderate level)
  2. Run npm audit on frontend (moderate level)
  3. Run Trivy vulnerability scanner on filesystem
  4. Upload SARIF results to GitHub Security

#### Code Quality
- **Steps:**
  1. Install dependencies for both backend and frontend
  2. Run code style checks
  3. Generate quality metrics

**Duration:** ~5-8 minutes

---

### 2. CD Pipeline (`cd.yml`)

**Trigger:** Push to `main` branch or manual workflow dispatch

**Jobs:**

#### Build and Push Backend Image
- **Steps:**
  1. Checkout code
  2. Login to GitHub Container Registry
  3. Extract Docker metadata (tags, labels)
  4. Setup Docker Buildx
  5. Build and push backend Docker image
  6. Use layer caching for optimization

**Image Tags:**
- `latest` (for default branch)
- `main` (branch name)
- `main-<sha>` (commit SHA)

#### Build and Push Frontend Image
- **Steps:**
  1. Checkout code
  2. Login to GitHub Container Registry
  3. Extract Docker metadata (tags, labels)
  4. Setup Docker Buildx
  5. Build and push frontend Docker image
  6. Use layer caching for optimization

**Image Tags:**
- `latest` (for default branch)
- `main` (branch name)
- `main-<sha>` (commit SHA)

#### Deployment Notification
- **Dependencies:** Both build jobs must complete
- **Steps:**
  1. Display deployment success message
  2. Show image URLs and tags

**Duration:** ~8-12 minutes (depending on build cache)

---

### 3. PR Checks (`pr-checks.yml`)

**Trigger:** Pull request opened, synchronized, or reopened

**Jobs:**

#### Validate PR
- Check commit messages
- Scan for sensitive files (`.env`, `.pem`, `.key`, etc.)
- Analyze PR size (files and lines changed)
- Warn if PR is too large (>100 files)

#### Lint Check
- Install dependencies
- Run backend linting
- Run frontend linting

#### Test Suite
- Install dependencies
- Run backend tests
- Build frontend

#### Auto Label
- Automatically label PRs based on changed files:
  - `backend` - Backend changes
  - `frontend` - Frontend changes
  - `dependencies` - Package.json changes
  - `docker` - Docker-related changes
  - `ci/cd` - Workflow changes
  - `documentation` - Markdown files

**Duration:** ~4-6 minutes

---

### 4. Dependency Updates (`dependency-updates.yml`)

**Trigger:** 
- Scheduled: Every Monday at 9 AM UTC
- Manual: Workflow dispatch

**Jobs:**

#### Dependency Review
- **Steps:**
  1. Check outdated backend dependencies
  2. Check outdated frontend dependencies
  3. Run security audit on backend (high level)
  4. Run security audit on frontend (high level)

**Duration:** ~2-3 minutes

---

## Docker Images

### Backend Image

**Base Image:** `node:18-alpine`

**Features:**
- Production-only dependencies
- Health check endpoint
- Exposed port: 5000

**Size:** ~150-200 MB

### Frontend Image

**Build Stage:** `node:18-alpine`
**Production Stage:** `nginx:alpine`

**Features:**
- Multi-stage build for optimized size
- Custom nginx configuration
- Gzip compression enabled
- Security headers
- Health check endpoint
- SPA routing support

**Size:** ~25-30 MB

---

## Environment Variables

### Required for Backend
- `NODE_ENV` - Environment (production/development)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration time (default: 7d)

### Optional for Backend
- `SMTP_HOST` - Email server host
- `SMTP_PORT` - Email server port
- `SMTP_USER` - Email username
- `SMTP_PASS` - Email password

### Required for Frontend (Build Time)
- `VITE_API_URL` - Backend API URL

---

## Monitoring and Notifications

### GitHub Actions Status
- All workflow runs are visible in the Actions tab
- Failed workflows send notifications to repository watchers
- Status badges on README show current pipeline status

### Security Scanning
- Trivy scan results uploaded to GitHub Security tab
- Dependabot alerts for vulnerable dependencies
- Weekly dependency review reports

---

## Best Practices Implemented

1. **Matrix Testing:** Tests run on multiple Node.js versions (18.x, 20.x)
2. **Layer Caching:** Docker builds use layer caching for faster rebuilds
3. **Multi-stage Builds:** Frontend uses multi-stage builds for smaller images
4. **Security Scanning:** Automated vulnerability detection
5. **Artifact Management:** Build artifacts retained for 7 days
6. **Health Checks:** Both images include health check endpoints
7. **Semantic Versioning:** Images tagged with version, branch, and commit SHA
8. **Fail-Safe:** Some steps marked as `continue-on-error` to prevent blocking
9. **Dependency Pinning:** Uses `npm ci` for reproducible installs
10. **Minimal Base Images:** Alpine Linux for smaller image sizes

---

## Deployment Options

### Option 1: Docker Compose (Recommended for Quick Start)
```bash
docker compose up -d
```

### Option 2: Pull Pre-built Images
```bash
docker pull ghcr.io/mo7amed7osam/unifreelance/backend:latest
docker pull ghcr.io/mo7amed7osam/unifreelance/frontend:latest
docker run -d ghcr.io/mo7amed7osam/unifreelance/backend:latest
docker run -d ghcr.io/mo7amed7osam/unifreelance/frontend:latest
```

### Option 3: Kubernetes
Use the provided Kubernetes manifests in `k8s/` directory

### Option 4: Cloud Platforms
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform

---

## Troubleshooting CI/CD

### Common Issues

#### 1. Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Review build logs in GitHub Actions

#### 2. Docker Build Failures
- Ensure Dockerfile syntax is correct
- Check for missing files referenced in COPY commands
- Verify base image availability

#### 3. Test Failures
- Run tests locally first
- Check test environment setup
- Review test logs in CI

#### 4. Authentication Errors (GHCR)
- Verify GitHub token permissions
- Check package write permissions in repository settings
- Ensure GITHUB_TOKEN is available in workflow

### Getting Help

1. Check workflow logs in GitHub Actions tab
2. Review this documentation
3. Check Docker and Node.js documentation
4. Open an issue on GitHub with logs and error messages

---

## Future Enhancements

- [ ] Add integration tests in CI pipeline
- [ ] Implement staging environment deployment
- [ ] Add performance benchmarking
- [ ] Set up automated database migrations
- [ ] Add code coverage reporting
- [ ] Implement canary deployments
- [ ] Add smoke tests after deployment
- [ ] Set up monitoring and alerting (Prometheus, Grafana)
- [ ] Implement automated rollback on failures
- [ ] Add end-to-end testing with Playwright/Cypress

---

## Maintenance

### Weekly Tasks
- Review dependency update reports
- Check security scan results
- Update outdated dependencies

### Monthly Tasks
- Review and optimize Docker images
- Update base images for security patches
- Review CI/CD performance metrics

### Quarterly Tasks
- Major dependency updates
- Review and update deployment documentation
- Audit access controls and secrets

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [12-Factor App Methodology](https://12factor.net/)
