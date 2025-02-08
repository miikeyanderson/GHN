import * as Sentry from '@sentry/react';
import { ApiError } from '../store/services/api';
import { store } from '../store';
import { addNotification } from '../store/slices/notificationsSlice';
import { clearCredentials } from '../store/slices/authSlice';

export interface ErrorResponse {
  message: string;
  code?: string;
  field?: string;
}

export const handleError = (error: unknown): ErrorResponse => {
  // Handle RTK Query API errors
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const apiError = error as ApiError;
    
    // Handle authentication errors
    if (apiError.status === 401) {
      store.dispatch(clearCredentials());
      return {
        message: 'Your session has expired. Please log in again.',
        code: 'AUTH_ERROR'
      };
    }

    // Handle validation errors
    if (apiError.status === 422 && 'data' in apiError) {
      return {
        message: apiError.data.detail || 'Validation error',
        code: 'VALIDATION_ERROR'
      };
    }

    // Handle server errors
    if (apiError.status >= 500) {
      Sentry.captureException(error);
      return {
        message: 'An unexpected error occurred. Our team has been notified.',
        code: 'SERVER_ERROR'
      };
    }

    return {
      message: apiError.data?.detail || 'An error occurred',
      code: `HTTP_${apiError.status}`
    };
  }

  // Handle network errors
  if (error instanceof Error) {
    if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
      return {
        message: 'Unable to connect to the server. Please check your internet connection.',
        code: 'NETWORK_ERROR'
      };
    }

    Sentry.captureException(error);
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR'
    };
  }

  // Handle unknown errors
  Sentry.captureException(error);
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
};

export const showErrorNotification = (error: unknown) => {
  const { message, code } = handleError(error);
  store.dispatch(
    addNotification({
      type: 'error',
      message,
      title: 'Error',
      autoHideDuration: 5000,
    })
  );
  return { message, code };
};
