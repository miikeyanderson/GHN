module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173'],
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // Additional metrics
        'unused-javascript': ['warn', { maxLength: 1 }],
        'modern-image-formats': ['warn', { maxLength: 1 }],
        'uses-responsive-images': ['warn', { maxLength: 1 }],
        'unminified-css': ['error', { maxLength: 0 }],
        'unminified-javascript': ['error', { maxLength: 0 }],
        'unused-css-rules': ['warn', { maxLength: 1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
