interface Config {
  env: string;
  apiUrl: string;
  sentry: {
    dsn: string | undefined;
    environment: string;
  };
}

const config: Config = {
  env: import.meta.env.VITE_APP_ENV || 'development',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
  },
};

export default config;
