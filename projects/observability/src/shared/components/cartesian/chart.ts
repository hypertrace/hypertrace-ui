import { TimeRange } from '@hypertrace/common';
import { LegendPosition } from '../legend/legend.component';
import { ChartTooltipRef } from '../utils/chart-tooltip/chart-tooltip-popover';
import { ChartEvent, ChartEventListener } from './chart-interactivty';
import { CartesianIntervalData } from './d3/legend/cartesian-interval-control.component';

export interface CartesianChart<TData> {
  destroy(): this;
  draw(): this;
  isDrawn(): boolean;
  withSeries(...series: Series<TData>[]): this;
  withLegend(legendPosition: LegendPosition): this;
  withEventListener(eventType: ChartEvent, listener: ChartEventListener<TData>): this;
  withAxis(axis: Axis): this;
  withIntervalData(intervalData: CartesianIntervalData): this;
  withTooltip(tooltip: ChartTooltipRef<TData>): this;
  withTimeRange(timeRange: TimeRange): this;
}

export interface Series<TData> {
  data: TData[];
  units?: string;
  summary?: Summary;
  color: string;
  name: string;
  symbol?: SeriesSymbol;
  type: CartesianSeriesVisualizationType;
  stacking?: boolean;
  hide?: boolean;
}

export interface Summary {
  value: number;
  units?: string;
}

export const enum SeriesSymbol {
  Circle,
  Square,
  Triangle,
  Cross
}

export const enum RenderingStrategy {
  Svg,
  Canvas,
  Auto
}

export const enum CartesianSeriesVisualizationType {
  Column,
  Line,
  Scatter,
  Area
}

export const enum AxisType {
  X,
  Y
}

export const enum AxisLocation {
  Left,
  Right,
  Top,
  Bottom
}

export interface Axis {
  /**
   * Type of axis (i.e. X or Y)
   */
  type: AxisType;
  /**
   * Location to place the axis relative to the chart
   */
  location: AxisLocation;
  /**
   * If true, display grid lines extending from this axis. Default false
   */
  gridLines?: boolean;

  /**
   * If true, display axis line (independent of tick marks). Default true.
   */
  axisLine?: boolean;

  /**
   * If true, display tick labels for this axis. Default true;
   */
  tickLabels?: boolean;

  /**
   * Scale type to use for axis
   */
  scale?: ScaleType;

  /**
   * Track mouse with crosshair
   */
  crosshair?: AxisCrosshair;

  /**
   * Minimum value of the axis. If unset, defaults to minimum value of provided data.
   */
  min?: number;

  /**
   * Maximum value of the axis. If unset, defaults to maximum value of provided data.
   */
  max?: number;
}

export interface AxisCrosshair {
  /**
   * If true, snaps to closest data point to mouse. If false, follows exact mouse location. Defaults to true.
   */
  snap?: boolean;
}

export enum ScaleType {
  Linear = 'linear',
  Time = 'time',
  Band = 'band'
}
