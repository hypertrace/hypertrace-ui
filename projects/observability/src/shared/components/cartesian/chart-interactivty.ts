import { MouseLocationData } from '../utils/mouse-tracking/mouse-tracking';
import { AxisType, Band, Series } from './chart';

export const enum ChartEvent {
  Click,
  DoubleClick,
  RightClick,
  Hover
}

export type ChartEventListener<TData> = (
  data: MouseLocationData<TData, Series<TData> | Band<TData>>[] | CartesianHoverData<TData>
) => void;

export interface ChartTooltipTrackingOptions {
  followSingleAxis?: AxisType;
  radius?: number;
}

export interface CartesianHoverData<TData> {
  groupId?: string;
  selectedData: MouseLocationData<TData, Series<TData> | Band<TData>>[];
}
