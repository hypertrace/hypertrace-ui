import { TimeRange } from '@hypertrace/common';
import { LegendPosition } from '../legend/legend.component';
import { ChartTooltipRef } from '../utils/chart-tooltip/chart-tooltip-popover';
import { ChartEvent, ChartEventListener } from './chart-interactivty';
import { CartesianIntervalData } from './d3/legend/cartesian-interval-control.component';

export interface CartesianChart<TInterval> {
  destroy(): this;
  draw(): this;
  isDrawn(): boolean;
  withSeries(...series: Series<TInterval>[]): this;
  withBands(...bands: Band<TInterval>[]): this;
  withLegend(legendPosition: LegendPosition): this;
  withEventListener(eventType: ChartEvent, listener: ChartEventListener<TInterval>): this;
  withAxis(axis: Axis): this;
  withIntervalData(intervalData: CartesianIntervalData): this;
  withTooltip(tooltip: ChartTooltipRef<TInterval>): this;
  withTimeRange(timeRange: TimeRange): this;
}

export interface Series<TInterval> {
  data: TInterval[];
  units?: string;
  summary?: Summary;
  color: string;
  // Override the default color string using a method that takes data point as input
  getColor?(datum?: TInterval): string;
  name: string;
  symbol?: SeriesSymbol;
  type: CartesianSeriesVisualizationType;
  stacking?: boolean;
  hide?: boolean;
  getTooltipTitle?(datum: TInterval): string;
}

export interface Band<TInterval> {
  upper: Series<TInterval>;
  lower: Series<TInterval>;
  color: string;
  opacity: number;
  name: string;
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
  DashedLine,
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
