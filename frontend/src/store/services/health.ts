import { api } from './api';

export interface HealthResponse {
  status: string;
  version: string;
  environment: string;
  timestamp: string;
  uptime_seconds: number;
  components: {
    [key: string]: {
      status: string;
      latency_ms: number;
      last_checked: string;
      details?: Record<string, unknown>;
      error?: string;
    };
  };
}

export const healthApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHealth: builder.query<HealthResponse, void>({
      query: () => '/health',
      providesTags: ['Health'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetHealthQuery } = healthApi;
