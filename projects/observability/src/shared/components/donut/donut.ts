import { LegendFontSize, LegendPosition } from '../legend/legend.component';
import { TooltipOption } from '../utils/d3/d3-visualization-builder.service';

export interface Donut {
  reflow(): void;
  destroy(): void;
}

export interface DonutConfiguration {
  series: DonutSeries[];
  center?: DonutCenter;
  legendPosition?: LegendPosition;
  tooltipOption?: TooltipOption;
  displayLegendCounts?: boolean;
  legendFontSize?: LegendFontSize;
  type: DonutChartType;
}

export interface DonutSeriesResults {
  series: DonutSeries[];
  total: number;
}

export interface DonutSeries {
  name: string;
  color?: string;
  value: number;
}

export interface DonutCenter {
  title: string;
  value: number;
}

export interface DonutResults {
  series: DonutSeries[];
  center?: DonutCenter;
}

export const enum DonutAlignmentStyle {
  Left = 'left-alignment',
  Center = 'center-alignment',
  Right = 'right-alignment'
}

export const enum DonutChartType {
  Pie = 'pie',
  Donut = 'donut'
}
