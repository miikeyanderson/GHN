import { type FC, type ReactNode } from 'react';
import GenericErrorBoundary from './GenericErrorBoundary';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

const AsyncErrorBoundary: FC<Props> = ({ children, fallback }) => {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <GenericErrorBoundary
      onError={(error) => {
        // Handle async errors specifically
        console.error('Async error caught:', error);
        reset(); // Reset any failed queries
      }}
      fallback={
        fallback || (
          <div className="p-4 rounded-md bg-red-50 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Failed to load data
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    There was an error loading the data. Please try again later.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => reset()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    >
      {children}
    </GenericErrorBoundary>
  );
};

export default AsyncErrorBoundary;
