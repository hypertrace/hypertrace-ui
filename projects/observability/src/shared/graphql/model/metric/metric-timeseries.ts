export interface MetricTimeseriesInterval {
  timestamp: Date;
  value: number;
  baseline?: number;
  upperBound?: number;
  lowerBound?: number;
}
