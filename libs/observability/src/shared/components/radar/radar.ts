import { Selection } from 'd3-selection';
import { LegendPosition } from '../legend/legend.component';
import { RadarObject } from './radar-object';

export interface RadarSeries {
  name: string;
  data: RadarPoint[];
  color: string;
  showPoints: boolean;
}

export interface RadarPoint {
  axis: string;
  value: number;
}

export interface RadarAxis {
  name: string;
}

export interface RadarPointEvent {
  point: RadarPoint;
  seriesName: string;
}

/* Internal Types */
export interface RadarOptions {
  title: string;
  axes: RadarAxis[];
  series: RadarSeries[];
  levels: number;
  chartMargin: RadarMarginOption;
  plotMargin: RadarMarginOption;
  tooltipOption: RadarTooltipOption;
  legendHeight: number;
  legendPosition: LegendPosition;
  onPointClicked(point: RadarPoint, seriesName: string): void;
  onSeriesClicked(seriesName: string): void;
}

export interface RadarMarginOption {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface RadarTooltipOption {
  visible: boolean;
}

export type RadarContainerSelection = Selection<HTMLElement, RadarObject, null, undefined>;
export type RadarSVGSelection = Selection<SVGElement, RadarObject, null, undefined>;

export const enum RadarLayoutStyleClass {
  Plot = 'plot-section',
  Axis = 'axis-section',
  Legend = 'legend-section',
  Tooltip = 'tooltip-section'
}
