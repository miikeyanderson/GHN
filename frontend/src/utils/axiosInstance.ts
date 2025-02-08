import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import config from '../config'
import useErrorTracking from '../hooks/useErrorTracking'

// Create a type for the performance metrics we'll track
interface RequestMetrics {
  startTime: number
  endTime?: number
  duration?: number
  size?: number
  status?: number
  cached?: boolean
}

// Create a Map to store request metrics
const requestMetricsMap = new Map<string, RequestMetrics>()

// Generate a unique request ID
const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Get response size in KB
const getResponseSize = (response: AxiosResponse): number => {
  const contentLength = response.headers['content-length']
  if (contentLength) {
    return Math.round(parseInt(contentLength, 10) / 1024)
  }
  // Fallback: estimate size from response data
  return Math.round(new Blob([JSON.stringify(response.data)]).size / 1024)
}

// Check if response was served from cache
const isResponseCached = (response: AxiosResponse): boolean => {
  return response.headers['x-cache'] === 'HIT' || 
         response.headers['cf-cache-status'] === 'HIT' ||
         response.headers['age'] !== undefined
}

const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Type for the extended error tracking hook
interface ExtendedErrorTracking extends ReturnType<typeof useErrorTracking> {
  addNetworkBreadcrumb: (method: string, url: string, status?: number, data?: unknown) => void
}

let errorTracking: ExtendedErrorTracking | null = null

export const initializeAxiosInstance = (trackingHook: ExtendedErrorTracking) => {
  errorTracking = trackingHook

  // Request Interceptor
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const requestId = generateRequestId()
      if (config.headers) {
        config.headers['X-Request-ID'] = requestId
      }

      // Start tracking metrics
      requestMetricsMap.set(requestId, {
        startTime: performance.now()
      })

      // Add breadcrumb for request start
      errorTracking?.addBreadcrumb(
        `Starting ${config.method?.toUpperCase()} request to ${config.url}`,
        'network',
        'info',
        {
          requestId,
          method: config.method,
          url: config.url,
          headers: config.headers,
          params: config.params,
          requestData: config.data
        }
      )

      return config
    },
    (error: AxiosError) => {
      errorTracking?.addBreadcrumb(
        'Request configuration error',
        'network',
        'error',
        {
          error: error.message,
          config: error.config
        }
      )
      return Promise.reject(error)
    }
  )

  // Response Interceptor
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      const requestId = response.config.headers?.['X-Request-ID'] as string
      const metrics = requestMetricsMap.get(requestId)

      if (metrics) {
        metrics.endTime = performance.now()
        metrics.duration = metrics.endTime - metrics.startTime
        metrics.size = getResponseSize(response)
        metrics.status = response.status
        metrics.cached = isResponseCached(response)

        // Add breadcrumb for successful response
        errorTracking?.addNetworkBreadcrumb(
          response.config.method || 'unknown',
          response.config.url || 'unknown',
          response.status,
          {
            requestId,
            metrics,
            headers: response.headers,
            responseData: response.data
          }
        )

        // Clean up metrics after a delay
        setTimeout(() => requestMetricsMap.delete(requestId), 30000)
      }

      return response
    },
    (error: AxiosError) => {
      const requestId = error.config?.headers?.['X-Request-ID'] as string
      const metrics = requestMetricsMap.get(requestId)

      if (metrics) {
        metrics.endTime = performance.now()
        metrics.duration = metrics.endTime - metrics.startTime
        metrics.status = error.response?.status

        // Add breadcrumb for failed response
        errorTracking?.addBreadcrumb(
          `Network request failed: ${error.message}`,
          'network',
          'error',
          {
            requestId,
            metrics,
            error: {
              message: error.message,
              code: error.code,
              status: error.response?.status,
              statusText: error.response?.statusText
            },
            response: error.response?.data,
            headers: error.response?.headers
          }
        )

        // Clean up metrics
        requestMetricsMap.delete(requestId)
      }

      return Promise.reject(error)
    }
  )
}

export default axiosInstance
