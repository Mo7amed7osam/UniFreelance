# UniFreelance Monitoring

This stack gives you:

- Prometheus for metrics
- Grafana for dashboards
- Blackbox Exporter for uptime probes
- Alertmanager for alert routing
- Loki + Promtail for Docker log aggregation

## What it monitors

- Azure backend `/health`
- Vercel frontend root
- Vercel frontend `/api/skills`
- Azure backend `/metrics`

## Run

Start the app stack first so the shared Docker network exists:

```bash
docker compose up -d
```

Then start monitoring:

```bash
docker compose -f docker-compose.monitoring.yml up -d
```

## URLs

- Grafana: `http://localhost:3000`
- Prometheus: `http://localhost:9090`
- Alertmanager: `http://localhost:9093`
- Loki: `http://localhost:3100`
- Blackbox Exporter: `http://localhost:9115`

Default Grafana credentials:

- user: `admin`
- password: `admin`

Override them with:

```bash
export GRAFANA_ADMIN_USER=admin
export GRAFANA_ADMIN_PASSWORD=strong-password
```

## Notes

- The Prometheus dashboard is pre-provisioned in Grafana.
- Promtail reads Docker logs from the local Docker socket, so Loki logs cover local Docker containers.
- Azure Container Instances logs are still best viewed in Azure CLI or Azure Portal because ACI does not expose a Docker socket.
- Update the hardcoded Azure and Vercel URLs in `monitoring/prometheus/prometheus.yml` if your deployment URLs change.
