// Simple performance utilities for FocusGuardian
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: Record<string, number[]> = {};

  private constructor() {}

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics[name]) {
      this.metrics[name] = [];
    }
    this.metrics[name].push(value);
    
    // Keep only last 50 measurements
    if (this.metrics[name].length > 50) {
      this.metrics[name] = this.metrics[name].slice(-50);
    }
  }

  getAverageMetric(name: string): number {
    const values = this.metrics[name];
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: any;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    }) as T;
  }

  throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  }

  getPerformanceReport(): { metrics: Record<string, number> } {
    const report: Record<string, number> = {};
    for (const name in this.metrics) {
      report[name] = this.getAverageMetric(name);
    }
    return { metrics: report };
  }

  cleanup(): void {
    this.metrics = {};
  }
}

export const performanceOptimizer = PerformanceOptimizer.getInstance();

export function usePerformanceMonitoring() {
  return {
    recordMetric: (name: string, value: number) => performanceOptimizer.recordMetric(name, value),
    getReport: () => performanceOptimizer.getPerformanceReport()
  };
}