import { MouseLocationData } from '../utils/mouse-tracking/mouse-tracking';
import { AxisType, Band, Series } from './chart';

export const enum ChartEvent {
  Click,
  DoubleClick,
  RightClick,
  Select
}

export type ChartEventListener<TData> = (
  data: MouseLocationData<TData, Series<TData> | Band<TData>>[] | ChartSelectedType<TData>
) => void;

export interface ChartTooltipTrackingOptions {
  followSingleAxis?: AxisType;
  radius?: number;
}

export interface ChartSelectedType<TData> {
  series: TData[];
  start: TData;
  end: TData;
}
