import { MouseLocationData } from '../utils/mouse-tracking/mouse-tracking';
import { AxisType, Range, Series } from './chart';

export const enum ChartEvent {
  Click,
  DoubleClick,
  RightClick
}

export type ChartEventListener<TData> = (data: MouseLocationData<TData, Series<TData> | Range<TData>>[]) => void;

export interface ChartTooltipTrackingOptions {
  followSingleAxis?: AxisType;
  radius?: number;
}
