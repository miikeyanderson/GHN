import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';

// Define base API types
export interface ApiError {
  status: number;
  data: {
    detail: string;
    code?: string;
  };
}

// Create our base API instance
export const api = createApi({
  baseQuery: retry(
    fetchBaseQuery({
      baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
      prepareHeaders: (headers, { getState }) => {
        // Get token from auth state
        const token = (getState() as RootState).auth.token;
        
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
        
        return headers;
      },
      credentials: 'include',
    }),
    {
      maxRetries: 3,
    }
  ),
  tagTypes: ['Health', 'User', 'Preferences'],
  endpoints: () => ({}),
});

// Export hooks for usage in components
export const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Health', 'User', 'Preferences'],
  endpoints: {},
});
