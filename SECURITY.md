# Security Guide

This document describes the current security posture of UniFreelance, the expected secret-handling process, and the gaps that still require hardening.

## Reporting a Security Issue

Do not open a public GitHub issue for a security vulnerability.

Preferred channels:

- GitHub Security Advisory for the repository
- direct private contact with the repository maintainer

A useful report should include:

- affected area
- reproduction steps
- impact
- suggested mitigation, if known

## Current Security Controls

Implemented in the repository today:

- JWT-based authentication
- password hashing with `bcryptjs`
- MongoDB credentials provided through environment variables
- Docker images built with production-focused runtime images
- GitHub Actions dependency audits
- Trivy filesystem scan in CI
- PR workflow check for common sensitive file patterns

## Current Security Limitations

These are important because they affect production readiness:

- backend CORS is currently open through `app.use(cors())`
- backend does not currently use Helmet
- backend does not currently use request rate limiting
- `JWT_SECRET` falls back to a default string if not set
- the backend runs over plain HTTP on Azure Container Instances and is intended to be reached through the Vercel proxy for browser traffic
- uploaded files are stored on local container filesystem paths, which are ephemeral in Azure Container Instances

## Required Secret Handling

Never commit:

- `.env`
- personal access tokens
- private keys
- cloud credentials
- MongoDB credentials

Use environment variables for:

- `MONGO_URI` or `MONGODB_URI`
- `JWT_SECRET`
- `SMTP_*`
- `GEMINI_*`
- GHCR tokens
- Azure credentials

If any secret has been exposed in chat, screenshots, terminal history, or a pushed commit, rotate it immediately.

## Deployment Security Checklist

Before deploying:

- set a real `JWT_SECRET`
- use a real MongoDB credential set
- confirm the backend image tag is a runtime tag, not `buildcache`
- confirm the backend image is built for `linux/amd64`
- confirm Vercel proxies frontend API requests through `/api`
- confirm the backend answers `/health`
- confirm GHCR package permissions are correct for Azure pulls

## CI Security Checks

Current CI security behavior:

- `npm audit` for backend
- `npm audit` for frontend
- Trivy repository scan
- SARIF upload to GitHub Security

These checks help, but they are not a full application security review.

## Recommended Hardening Work

High-priority improvements:

- require `JWT_SECRET` with no insecure fallback
- tighten CORS to trusted origins only
- add rate limiting on auth and write-heavy endpoints
- add Helmet or equivalent security headers for the backend
- move uploads to durable object storage instead of container disk
- add a formal secret rotation process
- add dependency update automation with actionable review output

## Monitoring and Incident Response

For application health:

- use Prometheus and Grafana from the local monitoring stack
- use Azure Container logs for backend runtime incidents

For backend runtime logs:

```bash
az container logs --resource-group gradproject-rg --name gradproject-back
```

For local monitoring details:

- [monitoring/README.md](monitoring/README.md)
