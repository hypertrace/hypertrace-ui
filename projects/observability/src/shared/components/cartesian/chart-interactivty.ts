import { MouseLocationData } from '../utils/mouse-tracking/mouse-tracking';
import { AxisType, Series } from './chart';

export const enum ChartEvent {
  Click,
  DoubleClick,
  RightClick
}

export type ChartEventListener<TData> = (data: MouseLocationData<TData, Series<TData>>[]) => void;

export interface ChartTooltipTrackingOptions {
  followSingleAxis?: AxisType;
  radius?: number;
}
