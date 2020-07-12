export interface SeriesState<TData> {
  getBaseline(datum: TData): number | undefined;
  getMaxValue(): number;
}
