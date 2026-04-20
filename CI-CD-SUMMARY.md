# CI/CD Summary

This is the short operational summary of the UniFreelance pipeline.

## Current State

- CI is active for `main` and `develop`
- CD is active for `main`
- images are published to GHCR
- backend and frontend builds are path-aware
- backend and frontend images are built for `linux/amd64`

## What Works

- backend-only change triggers backend CI and backend image build
- frontend-only change triggers frontend CI and frontend image build
- workflow changes trigger both sides
- backend runtime image uses Node `20`
- frontend image can receive `VITE_API_URL` during build

## Important Rules

- deploy runtime tags like `latest` or SHA tags
- never deploy `buildcache`
- backend production runtime is `node src/server.js`
- backend production port is `5000`
- frontend should use `/api` behind Vercel rewrites

## Workflow Inventory

- `ci.yml`: build, test, security scan, artifact build
- `cd.yml`: build and publish Docker images
- `pr-checks.yml`: PR validation and labels
- `dependency-updates.yml`: scheduled dependency review

## Gaps Still Present

- no real lint scripts
- no frontend automated tests
- no automatic Azure deployment from GitHub Actions
- some PR checks are permissive by design

## Operational Recommendation

Treat the current pipeline as a solid image-build and validation pipeline. Use it to publish trustworthy container images, then deploy those images through a separate controlled Azure release step.
