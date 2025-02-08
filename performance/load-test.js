import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 20 },   // Ramp up to 20 users
    { duration: '3m', target: 20 },   // Stay at 20 users
    { duration: '1m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests can fail
  },
};

const BASE_URL = __ENV.TARGET_URL || 'https://staging.ghn.dev';

export default function () {
  const endpoints = {
    home: `${BASE_URL}/`,
    health: `${BASE_URL}/api/health`,
    // Add more endpoints as they become available
  };

  // Home page
  const homeRes = http.get(endpoints.home);
  check(homeRes, {
    'home status is 200': (r) => r.status === 200,
    'home response time OK': (r) => r.timings.duration < 500,
  });

  // Health check
  const healthRes = http.get(endpoints.health);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health response time OK': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
