import { Observable } from 'rxjs';
import { TooltipOption } from '../utils/d3/d3-visualization-builder.service';

export interface BubbleChart<T> {
  reflow(): void;
  destroy(): void;
  selections$: Observable<Set<T>>;
  updateSelections(selectionsToRemove: T[]): void;
}

export interface BubbleChartConfiguration<T extends BubbleChartData> {
  data: T[];
  determineColor?(colorKey: string): string;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  tooltipOption?: BubbleChartTooltipOption;
  selections?: T[];
  maxAllowedSelectionsCount?: number;
}

export interface BubbleChartData {
  x: number;
  y: number;
  r: number;
  colorKey: string;
}

export type BubbleChartTooltipOption = TooltipOption;
