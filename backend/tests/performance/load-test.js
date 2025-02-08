import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 20 }, // Ramp up to 20 users
    { duration: '3m', target: 20 }, // Stay at 20 users
    { duration: '1m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    'http_req_duration{type:staticAsset}': ['p(95)<100'], // 95% of static asset requests should be below 100ms
    errors: ['rate<0.1'], // Error rate should be below 10%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export default function () {
  const endpoints = {
    health: `${BASE_URL}/api/health`,
    metrics: `${BASE_URL}/api/metrics`,
    // Add more endpoints as they become available
  };

  // Health check
  const healthRes = http.get(endpoints.health, {
    tags: { type: 'healthCheck' },
  });
  check(healthRes, {
    'health check returns 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Metrics check
  const metricsRes = http.get(endpoints.metrics, {
    tags: { type: 'metrics' },
  });
  check(metricsRes, {
    'metrics check returns 200': (r) => r.status === 200,
    'metrics response is json': (r) => r.headers['Content-Type'].includes('application/json'),
  }) || errorRate.add(1);

  sleep(2);
}
