const client = require('prom-client');
const mongoose = require('mongoose');

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: 'shaghalny_backend_',
});

const httpRequestsInFlight = new client.Gauge({
  name: 'shaghalny_backend_http_requests_in_flight',
  help: 'Current number of in-flight HTTP requests.',
  registers: [register],
});

const httpRequestsTotal = new client.Counter({
  name: 'shaghalny_backend_http_requests_total',
  help: 'Total number of HTTP requests handled by the backend.',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestErrorsTotal = new client.Counter({
  name: 'shaghalny_backend_http_request_errors_total',
  help: 'Total number of HTTP requests that completed with 5xx responses.',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'shaghalny_backend_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds.',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

const mongoConnectionState = new client.Gauge({
  name: 'shaghalny_backend_mongodb_connection_state',
  help: 'MongoDB connection state reported by Mongoose. 0=disconnected, 1=connected, 2=connecting, 3=disconnecting.',
  registers: [register],
  collect() {
    this.set(mongoose.connection.readyState);
  },
});

const normalizedRoute = (req) => {
  if (req.route && req.route.path) {
    const baseUrl = req.baseUrl || '';
    const routePath = typeof req.route.path === 'string' ? req.route.path : 'dynamic';
    return `${baseUrl}${routePath}`.replace(/\/+/g, '/');
  }

  if (req.path === '/health') {
    return '/health';
  }

  if (req.path === '/metrics') {
    return '/metrics';
  }

  return 'unmatched';
};

const metricsMiddleware = (req, res, next) => {
  if (req.path === '/metrics') {
    return next();
  }

  httpRequestsInFlight.inc();
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationInSeconds = Number(process.hrtime.bigint() - startedAt) / 1e9;
    const labels = {
      method: req.method,
      route: normalizedRoute(req),
      status_code: String(res.statusCode),
    };

    httpRequestsInFlight.dec();
    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationInSeconds);

    if (res.statusCode >= 500) {
      httpRequestErrorsTotal.inc(labels);
    }
  });

  next();
};

const metricsHandler = async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

module.exports = {
  register,
  metricsMiddleware,
  metricsHandler,
  mongoConnectionState,
};
