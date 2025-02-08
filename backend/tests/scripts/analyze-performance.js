const fs = require('fs');

// Read the k6 results file
const resultsFile = process.argv[2];
const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));

// Define performance thresholds
const thresholds = {
  http_req_duration: {
    p95: 500, // 95th percentile should be under 500ms
    median: 200, // median should be under 200ms
  },
  http_reqs: {
    rate: 50, // should handle at least 50 requests per second
  },
  errors: {
    rate: 0.1, // error rate should be under 10%
  },
};

// Analyze metrics
const metrics = {
  duration: {
    p95: results.metrics.http_req_duration.values['p(95)'],
    median: results.metrics.http_req_duration.values['p(50)'],
  },
  requests: {
    rate: results.metrics.http_reqs.values.rate,
  },
  errors: {
    rate: results.metrics.errors ? results.metrics.errors.values.rate : 0,
  },
};

// Check if performance meets thresholds
const violations = [];

if (metrics.duration.p95 > thresholds.http_req_duration.p95) {
  violations.push(`95th percentile response time (${metrics.duration.p95}ms) exceeds threshold (${thresholds.http_req_duration.p95}ms)`);
}

if (metrics.duration.median > thresholds.http_req_duration.median) {
  violations.push(`Median response time (${metrics.duration.median}ms) exceeds threshold (${thresholds.http_req_duration.median}ms)`);
}

if (metrics.requests.rate < thresholds.http_reqs.rate) {
  violations.push(`Request rate (${metrics.requests.rate}/s) below threshold (${thresholds.http_reqs.rate}/s)`);
}

if (metrics.errors.rate > thresholds.errors.rate) {
  violations.push(`Error rate (${metrics.errors.rate * 100}%) exceeds threshold (${thresholds.errors.rate * 100}%)`);
}

// Output results
console.log('\nPerformance Test Results:');
console.log('------------------------');
console.log(`Response Times:
  - 95th percentile: ${metrics.duration.p95}ms
  - Median: ${metrics.duration.median}ms`);
console.log(`Request Rate: ${metrics.requests.rate}/s`);
console.log(`Error Rate: ${metrics.errors.rate * 100}%`);

if (violations.length > 0) {
  console.log('\nPerformance Violations:');
  violations.forEach(v => console.log(`- ${v}`));
  process.exit(1);
} else {
  console.log('\nAll performance metrics within acceptable thresholds.');
  process.exit(0);
}
