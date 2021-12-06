export interface MouseDataLookupStrategy<TData, TContext> {
  dataForLocation(location: RelativeMouseLocation): MouseLocationData<TData, TContext>[];
}

export interface MouseLocationData<TData, TContext> {
  dataPoint: TData;
  location: RelativeMouseLocation;
  context: TContext;
}

export interface RelativeMouseLocation {
  x: number;
  y: number;
}
