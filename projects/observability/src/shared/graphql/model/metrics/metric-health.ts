export const enum MetricHealth {
  Healthy = 'healthy',
  Warning = 'warning',
  Severe = 'severe',
  Critical = 'critical',
  NotSpecified = 'notspecified'
}

export const allMetricHealthValues = [
  MetricHealth.Healthy,
  MetricHealth.Critical,
  MetricHealth.Warning,
  MetricHealth.Severe,
  MetricHealth.NotSpecified
] as const;
