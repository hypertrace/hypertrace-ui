export interface TimeRange {
  readonly startTime: Date;
  readonly endTime: Date;
  toUrlString(): string;
  toDisplayString(): string;
  isCustom(): boolean;
}
