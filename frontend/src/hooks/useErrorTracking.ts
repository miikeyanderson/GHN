import * as Sentry from '@sentry/react'

interface ErrorContext {
  [key: string]: any
}

interface SystemInfo {
  timestamp: number
  url: string
  userAgent: string
  screenSize: string
  memory?: string
}

const getSystemInfo = (): SystemInfo => {
  const info: SystemInfo = {
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
  }
  
  // Add memory info if available
  if ('memory' in performance) {
    const memory = (performance as any).memory
    info.memory = `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB / ${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
  }
  
  return info
}

const useErrorTracking = () => {
  const addBreadcrumb = (
    message: string,
    category: string = 'app',
    level: Sentry.SeverityLevel = 'info',
    data?: ErrorContext
  ) => {
    const systemInfo = getSystemInfo()
    
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data: {
        ...data,
        systemInfo
      },
      timestamp: systemInfo.timestamp
    })
  }

  const captureError = (
    error: Error,
    context?: ErrorContext,
    level: Sentry.SeverityLevel = 'error'
  ) => {
    const systemInfo = getSystemInfo()
    const errorContext = {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      systemInfo,
      performance: {
        navigation: performance.getEntriesByType('navigation')[0],
        resources: performance.getEntriesByType('resource')
          .filter(r => r.initiatorType === 'fetch' || r.initiatorType === 'xmlhttprequest')
          .map(r => ({
            name: r.name,
            duration: r.duration,
            startTime: r.startTime,
            initiatorType: r.initiatorType
          }))
      }
    }

    // Add a final breadcrumb right before capturing the error
    addBreadcrumb(
      'Error occurred',
      'error',
      'error',
      errorContext
    )

    Sentry.captureException(error, {
      level,
      extra: errorContext
    })
  }

  const startErrorFlow = (flowName: string, context?: ErrorContext) => {
    const systemInfo = getSystemInfo()
    const flowContext = {
      ...context,
      flowStart: systemInfo.timestamp,
      systemInfo
    }

    addBreadcrumb(
      `Starting ${flowName}`,
      'flow',
      'info',
      flowContext
    )

    return flowContext
  }

  const endErrorFlow = (flowName: string, context?: ErrorContext) => {
    const systemInfo = getSystemInfo()
    const flowContext = {
      ...context,
      flowEnd: systemInfo.timestamp,
      duration: context?.flowStart ? systemInfo.timestamp - context.flowStart : undefined,
      systemInfo
    }

    addBreadcrumb(
      `Completed ${flowName}`,
      'flow',
      'info',
      flowContext
    )

    return flowContext
  }

  const addUserInteraction = (action: string, element: string, data?: ErrorContext) => {
    addBreadcrumb(
      `User interaction: ${action} on ${element}`,
      'interaction',
      'info',
      data
    )
  }

  const addNetworkBreadcrumb = (method: string, url: string, status?: number, data?: ErrorContext) => {
    addBreadcrumb(
      `Network ${method.toUpperCase()}: ${url}`,
      'network',
      status && status >= 400 ? 'error' : 'info',
      {
        ...data,
        method,
        url,
        status
      }
    )
  }

  return {
    addBreadcrumb,
    captureError,
    startErrorFlow,
    endErrorFlow,
    addUserInteraction,
    addNetworkBreadcrumb
  }
}

export default useErrorTracking
