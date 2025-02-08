import * as Sentry from '@sentry/react';

// Performance API types
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  duration: number;
  cancelable: boolean;
  target?: Node;
}

interface PerformanceNavigationTiming extends PerformanceEntry {
  unloadEventStart: number;
  unloadEventEnd: number;
  domInteractive: number;
  domContentLoadedEventStart: number;
  domContentLoadedEventEnd: number;
  domComplete: number;
  loadEventStart: number;
  loadEventEnd: number;
  type: 'navigate' | 'reload' | 'back_forward' | 'prerender';
  redirectCount: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

interface WebVitals {
  fcp: number;  // First Contentful Paint
  lcp: number;  // Largest Contentful Paint
  fid: number;  // First Input Delay
  cls: number;  // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private webVitals: WebVitals = {
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
  };

  private constructor() {
    this.initializePerformanceObserver();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializePerformanceObserver(): void {
    if (typeof window === 'undefined') return;

    // Observe paint timing
    const paintObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.webVitals.fcp = entry.startTime;
          this.reportWebVital('FCP', entry.startTime);
        }
      }
    });
    paintObserver.observe({ entryTypes: ['paint'] });

    // Observe layout shifts
    const layoutShiftObserver = new PerformanceObserver((entryList) => {
      let clsValue = 0;
      for (const entry of entryList.getEntries()) {
        const layoutShift = entry as LayoutShift;
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
        }
      }
      this.webVitals.cls = clsValue;
      this.reportWebVital('CLS', clsValue);
    });
    layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });

    // Observe largest contentful paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.webVitals.lcp = lastEntry.startTime;
      this.reportWebVital('LCP', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Observe first input delay
    const fidObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const firstInput = entry as PerformanceEventTiming;
        this.webVitals.fid = firstInput.processingStart - firstInput.startTime;
        this.reportWebVital('FID', this.webVitals.fid);
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Observe navigation timing
    const navigationObserver = new PerformanceObserver((entryList) => {
      const navigationEntry = entryList.getEntries()[0] as PerformanceNavigationTiming;
      this.webVitals.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      this.reportWebVital('TTFB', this.webVitals.ttfb);
    });
    navigationObserver.observe({ entryTypes: ['navigation'] });
  }

  private reportWebVital(metric: string, value: number): void {
    const rating = this.getRating(metric, value);
    this.addMetric(metric, value, rating);

    // Report to Sentry
    Sentry.captureMessage(`Web Vital: ${metric}`, {
      level: rating === 'poor' ? 'warning' : 'info',
      extra: {
        metric,
        value,
        rating,
      },
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Web Vital: ${metric}`, {
        value,
        rating,
      });
    }
  }

  private getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    // Thresholds based on web.dev/vitals
    switch (metric) {
      case 'FCP':
        return value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor';
      case 'LCP':
        return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
      case 'FID':
        return value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor';
      case 'CLS':
        return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor';
      case 'TTFB':
        return value < 200 ? 'good' : value < 500 ? 'needs-improvement' : 'poor';
      default:
        return 'needs-improvement';
    }
  }

  private addMetric(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor'): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)?.push({ name, value, rating });
  }

  public getMetrics(): Map<string, PerformanceMetric[]> {
    return this.metrics;
  }

  public getWebVitals(): WebVitals {
    return this.webVitals;
  }

  public clearMetrics(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
