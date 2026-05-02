# Monitoring Stack

This repository includes a local observability stack for Shaghalny using Grafana, Prometheus, Alertmanager, Loki, Promtail, and Blackbox Exporter.

## What It Monitors

- Azure backend `/health`
- Azure backend `/metrics`
- Vercel frontend root URL
- Vercel frontend `/api/skills`
- local Docker container logs through Promtail and Loki

## Services

- Grafana for dashboards
- Prometheus for metrics and alert rules
- Alertmanager for alert routing
- Blackbox Exporter for external uptime probes
- Loki for log storage
- Promtail for Docker log shipping

## Start the Stack

```bash
docker compose -f docker-compose.monitoring.yml up -d
```

Stop it:

```bash
docker compose -f docker-compose.monitoring.yml down
```

Validate the compose file:

```bash
docker compose -f docker-compose.monitoring.yml config
```

## Local URLs

- Grafana: `http://localhost:3001`
- Prometheus: `http://localhost:9090`
- Alertmanager: `http://localhost:9093`
- Loki: `http://localhost:3100`
- Blackbox Exporter: `http://localhost:9115`

Default Grafana credentials:

- username: `admin`
- password: `admin`

Optional overrides:

```bash
export GRAFANA_ADMIN_USER=admin
export GRAFANA_ADMIN_PASSWORD=strong-password
export GRAFANA_PORT=3001
```

## What Is Preconfigured

- Prometheus scrape jobs
- Prometheus alert rules
- Grafana datasources
- Grafana dashboard provisioning
- uptime probes for frontend and backend

Provisioned dashboard:

- `Shaghalny Monitoring`

## Validation Commands

Prometheus ready check:

```bash
curl http://localhost:9090/-/ready
```

Grafana health:

```bash
curl http://localhost:3001/api/health
```

Prometheus targets:

```bash
curl http://localhost:9090/api/v1/targets
```

Alert rules:

```bash
curl http://localhost:9090/api/v1/rules
```

## Logs

Promtail reads local Docker logs through `/var/run/docker.sock`.

That means Loki covers:

- local Docker Compose containers
- local monitoring containers

It does not directly ingest Azure Container Instances logs.

For Azure backend logs, use:

```bash
az container logs --resource-group gradproject-rg --name gradproject-back
```

## Important Notes

- Grafana runs on `3001` because `3000` is commonly occupied on local machines
- Loki may reject very old historical container logs on first bootstrap; new logs still ingest correctly
- if the Azure backend hostname or Vercel URL changes, update:
  - `monitoring/prometheus/prometheus.yml`
  - `monitoring/grafana/dashboards/shaghalny-monitoring.json`

## Key Files

- [`docker-compose.monitoring.yml`](../docker-compose.monitoring.yml)
- [`monitoring/prometheus/prometheus.yml`](prometheus/prometheus.yml)
- [`monitoring/prometheus/rules/alerts.yml`](prometheus/rules/alerts.yml)
- [`monitoring/grafana/dashboards/shaghalny-monitoring.json`](grafana/dashboards/shaghalny-monitoring.json)
- [`monitoring/loki/config.yml`](loki/config.yml)
- [`monitoring/promtail/config.yml`](promtail/config.yml)
