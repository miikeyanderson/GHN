import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    'http_req_duration{type:auth}': ['p(95)<600'],  // Auth requests can take longer
    errors: ['rate<0.1'],  // Error rate must be less than 10%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8000';

export default function () {
  // Health check
  const healthCheck = http.get(`${BASE_URL}/health`);
  check(healthCheck, {
    'health check returns 200': (r) => r.status === 200,
  });

  // API version check
  const versionCheck = http.get(`${BASE_URL}/version`);
  check(versionCheck, {
    'version check returns 200': (r) => r.status === 200,
    'version is present': (r) => r.json().version !== undefined,
  });

  // Simulated auth request
  const authPayload = JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword',
  });

  const authCheck = http.post(`${BASE_URL}/auth/login`, authPayload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { type: 'auth' },
  });

  check(authCheck, {
    'auth returns 200': (r) => r.status === 200,
    'auth returns token': (r) => r.json().token !== undefined,
  }) || errorRate.add(1);

  sleep(1);
}
