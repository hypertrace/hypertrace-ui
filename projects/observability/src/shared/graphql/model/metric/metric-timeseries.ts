export interface MetricTimeseriesInterval {
  timestamp: Date;
  value: number;
}

export interface MetricTimeseriesBandInterval extends MetricTimeseriesInterval {
  upperBound: number;
  lowerBound: number;
}
