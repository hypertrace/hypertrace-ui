import { TimeRange } from '@hypertrace/common';
import { MouseLocationData } from '../utils/mouse-tracking/mouse-tracking';
import { AxisType, Band, Series } from './chart';

export const enum ChartEvent {
  Click,
  DoubleClick,
  RightClick,
  Hover,
  Select
}

export type ChartEventListener<TData> = (
  data:
    | MouseLocationData<TData, Series<TData> | Band<TData>>[]
    | CartesianSelectedData<TData>
    | CartesianHoverData<TData>
) => void;

export interface ChartTooltipTrackingOptions {
  followSingleAxis?: AxisType;
  radius?: number;
}

export interface CartesianHoverData<TData> {
  groupId?: string;
  selectedData: MouseLocationData<TData, Series<TData> | Band<TData>>[];
}
export interface CartesianSelectedData<TData> {
  timeRange: TimeRange;
  selectedData: MouseLocationData<TData, Series<TData> | Band<TData>>[];
  location: {
    x: number;
    y: number;
  };
}
