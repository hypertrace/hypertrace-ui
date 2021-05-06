export interface MetricTimeseriesInterval {
  timestamp: Date;
  value?: number;
}

export interface MetricTimeseriesBandInterval {
  timestamp: Date;
  upperBound: number;
  lowerBound: number;
}
