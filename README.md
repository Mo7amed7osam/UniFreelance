<<<<<<< HEAD
# AI Technical Interviewer 🎤🤖

Alaa — Question Delivery Module

---

## 📋 Responsibilities

- Generate 5 questions using Claude AI (via Anthropic API or OpenRouter) based on the selected topic
- Read questions aloud using Text-to-Speech (Windows PowerShell)
- Display questions sequentially and wait for student answers
- Adaptive difficulty — increases or decreases based on student performance
- Supports 16 built-in topics + custom topic input
- Supports both CLI mode and API mode (for team integration)

---

## 📂 Files

| File | Purpose |
| --- | --- |
| `question_delivery.py` | Main interview logic |
| `api.py` | FastAPI endpoints for the team |
| `shared.py` | Shared data between modules (`sessions_store`, `answers_store`, `answers_lock`) |
| `state_{session_id}.json` | Real-time interview state per session (for team) |
| `interview_log.txt` | Full log after interview ends (for team) |
| `.env` | API keys and model configuration |

---

## ⚙️ Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Copy `.env.example` and rename it `.env`, then add your API key.

**Option A — Anthropic API (direct):**

```
ANTHROPIC_API_KEY=sk-ant-api...
```

**Option B — OpenRouter:**

```
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=anthropic/claude-3.5-haiku
```

> If both keys are set, OpenRouter takes priority.

3. Run the interview directly (CLI mode):

```bash
python question_delivery.py
```

4. Or run the API for the team:

```bash
uvicorn api:app --reload
```

---

## 🎯 Available Topics

| Number | Topic |
| --- | --- |
| 1 | Python |
| 2 | Java |
| 3 | C++ |
| 4 | SQL |
| 5 | Frontend (HTML, CSS, JavaScript) |
| 6 | Backend (REST APIs, HTTP, Django/Node) |
| 7 | DevOps and Cloud |
| 8 | Machine Learning |
| 9 | Data Science and Statistics |
| 10 | Cybersecurity |
| 11 | Operating Systems |
| 12 | Computer Networks |
| 13 | Mobile Development (Android/iOS) |
| 14 | Software Testing and QA |
| 15 | System Design |
| 16 | Data Structures and Algorithms |
| C | Custom topic (type your own) |

---

## 🔗 Integration with Team

### API Endpoints — at `http://localhost:8000`

| Endpoint | Method | Used By | Description |
| --- | --- | --- | --- |
| `/start?student_name=alaa&topic=Python` | POST | Frontend | Starts the interview, returns `session_id` |
| `/state/{session_id}` | GET | Frontend + Camera | Returns current interview state |
| `/answer?session_id=...&answer=...` | POST | Frontend | Submits student answer |
| `/results/{student_name}` | GET | Backend | Returns all results for a student |

> ⚠️ **Important:** Always use `session_id` (returned from `/start`) when calling `/answer`.
> The `/answer` endpoint rejects requests if the session status is not `recording`.

---

### Example `/start` Response

```json
{
  "message": "Interview started",
  "session_id": "abc-123-xyz",
  "topic": "Python"
}
```

---

### Example `/state/{session_id}` Response

```json
{
  "status": "recording",
  "data": {
    "question": "What is a decorator?",
    "level": "Hard",
    "question_num": 3,
    "student_name": "alaa",
    "topic": "Python"
  }
}
```

**Status values:**

| Status | Meaning |
| --- | --- |
| `idle` | Interview just started, not yet asking |
| `waiting` | Question displayed, waiting for timer |
| `recording` | Actively waiting for student answer |
| `done` | Interview finished |
| `stopped` | Interview stopped manually |
| `not_found` | Session ID does not exist |

---

### Example `/answer` Request

```
POST /answer?session_id=abc-123-xyz&answer=A decorator is a function that wraps another function
```

> ⚠️ Empty answers are rejected with an error response.

---

### Example `/answer` Error Responses

```json
{ "error": "Not accepting answers right now", "current_status": "waiting" }
```

```json
{ "error": "Empty answer not allowed" }
```

```json
{ "error": "Session not found" }
```

---

### Example `/results/{student_name}` Response

```json
{
  "student": "alaa",
  "results": [
    {
      "timestamp": "2026-04-20 01:00:00",
      "student": "alaa",
      "topic": "Python",
      "question_num": "Q1",
      "level": "[Medium]",
      "question": "What is OOP?",
      "answer": "Object-oriented programming ...",
      "elapsed": "4.04s",
      "adapted": "adapt:up"
    }
  ]
}
```

---

## ⏱️ Time Limits & Adaptive Difficulty

| Level | Time Limit |
| --- | --- |
| Easy | 20s |
| Medium | 25s |
| Hard | 30s |

**Difficulty adapts automatically based on answer speed:**

| Answer Time | Action |
| --- | --- |
| Under 10s | Level goes **UP** |
| 10s – 20s | Level stays the **SAME** |
| Over 20s | Level goes **DOWN** |

---

## 🔁 Repeat Feature

Students can type `r` (or `repeat` / `again`) and press Enter to hear the question again.
Each student gets **one repeat per question** only.

---

## 🚨 Notes for the Team

- The interview runs in a **background thread** — do not block `/start`
- State is stored in both memory (`sessions_store`) and a file (`state_{session_id}.json`)
- If no API key is set, the system falls back to **pre-written questions automatically**
- TTS only works on **Windows** (uses PowerShell System.Speech)

---

## 👩‍💻 Author

Alaa
=======
# UniFreelance

[![CI Pipeline](https://github.com/Mo7amed7osam/UniFreelance/actions/workflows/ci.yml/badge.svg)](https://github.com/Mo7amed7osam/UniFreelance/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/Mo7amed7osam/UniFreelance/actions/workflows/cd.yml/badge.svg)](https://github.com/Mo7amed7osam/UniFreelance/actions/workflows/cd.yml)
[![PR Checks](https://github.com/Mo7amed7osam/UniFreelance/actions/workflows/pr-checks.yml/badge.svg)](https://github.com/Mo7amed7osam/UniFreelance/actions/workflows/pr-checks.yml)

UniFreelance is a student-focused freelancing marketplace built with a React frontend and an Express/MongoDB backend. The platform supports job posting, proposals, admin review flows, and video-based skill verification.

## Documentation

- [Quick Start](QUICKSTART.md)
- [Deployment Guide](DEPLOYMENT.md)
- [CI/CD Guide](CICD.md)
- [CI/CD Summary](CI-CD-SUMMARY.md)
- [Monitoring Guide](monitoring/README.md)
- [Contributing](CONTRIBUTING.md)
- [Testing](TESTING.md)
- [Security](SECURITY.md)

## Architecture

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Auth: JWT
- Containerization: Docker and Docker Compose
- Image Registry: GitHub Container Registry
- Frontend Hosting: Vercel
- Backend Hosting: Azure Container Instances
- Monitoring: Grafana, Prometheus, Loki, Promtail, Blackbox Exporter, Alertmanager

## Repository Layout

```text
.
├── backend/                  # Express API
├── frontend/                 # Vite React application
├── monitoring/               # Prometheus, Grafana, Loki, Alertmanager config
├── .github/workflows/        # CI, CD, PR, dependency automation
├── docker-compose.yml        # Local application stack
├── docker-compose.monitoring.yml
└── *.md                      # Project documentation
```

## Local Development

### Option 1: Docker Compose

Create a root `.env` file, then start the full local stack:

```bash
docker compose up -d
```

Default local endpoints:

- Frontend: `http://localhost`
- Backend: `http://localhost:5000`
- Backend health: `http://localhost:5000/health`
- MongoDB: `mongodb://localhost:27017`

Stop the stack:

```bash
docker compose down
```

### Option 2: Run Services Manually

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Manual development endpoints:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Required Configuration

There is no committed `.env.example` file in this repository. Create your own `.env` values based on the application needs.

Minimum backend variables:

```env
MONGO_URI=mongodb://admin:password@mongodb:27017/unifreelance?authSource=admin
JWT_SECRET=change-this-in-real-environments
PORT=5000
```

Additional backend variables used by optional features:

- `INSTAPAY_RECEIVER_NUMBER`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `GEMINI_API_URL`
- `GEMINI_API_KEY`

Frontend build-time variable:

- `VITE_API_URL`

The frontend defaults to `/api` when `VITE_API_URL` is not set.

## Production Topology

The current production setup reflected in this repository is:

- Frontend deployed on Vercel
- Backend deployed on Azure Container Instances
- Frontend API traffic proxied through `frontend/vercel.json`
- Backend container image published to GHCR

Important production notes:

- The backend image must be built for `linux/amd64` for Azure Container Instances.
- The backend runtime image tag is `latest` or a SHA-based runtime tag, not `buildcache`.
- The backend listens on `0.0.0.0:5000`.
- The frontend should call `/api`, not the backend Azure HTTP URL directly, to avoid mixed-content problems in the browser.

## Monitoring

The repository includes a full local monitoring stack in `docker-compose.monitoring.yml`.

Once started, local monitoring endpoints are:

- Grafana: `http://localhost:3001`
- Prometheus: `http://localhost:9090`
- Alertmanager: `http://localhost:9093`
- Loki: `http://localhost:3100`
- Blackbox Exporter: `http://localhost:9115`

Full details: [monitoring/README.md](monitoring/README.md)

## Current CI/CD Behavior

- CI runs on push and pull request for `main` and `develop`
- CI uses Node `20.x`
- CD builds only the changed service image on pushes to `main`
- Docker images are published to GHCR
- CD uses `buildcache` only for layer caching, not as a deployable image tag
- Frontend Docker builds can consume `VITE_API_URL` from a GitHub Actions repository variable

Full details: [CICD.md](CICD.md)
>>>>>>> 7189b4100a3307b82bc95b0183a05800ad4cb1dc
