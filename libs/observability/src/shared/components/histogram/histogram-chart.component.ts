import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ColorService, TypedSimpleChanges } from '@hypertrace/common';
import { maxBy } from 'lodash-es';

@Component({
  selector: 'ht-histogram-chart',
  styleUrls: ['./histogram-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-histogram-chart">
      <div *ngFor="let histogramBar of histogramBars" class="histogram-bar">
        <div
          class="bar-label"
          [htTooltip]="histogramBar.label"
          (click)="this.onLabelClick(histogramBar.label)"
          [ngClass]="{ clickable: this.labelClickable }"
        >
          {{ histogramBar.label }}
        </div>
        <div class="bar-value" [htTooltip]="histogramBar.value">
          <div class="bar" [ngStyle]="histogramBar.style"></div>
          <div class="value">{{ histogramBar.value | htDisplayNumber }}</div>
        </div>
      </div>
    </div>
  `
})
export class HistogramChartComponent implements OnChanges {
  @Input()
  public data: HistogramBarData[] = [];

  @Input()
  public labelClickable: boolean = false;

  @Input()
  public determineColor?: (colorKey: string) => string;

  @Output()
  public readonly labelClick: EventEmitter<string> = new EventEmitter();

  public histogramBars: HistogramBarOptions[] = [];

  public constructor(private readonly colorService: ColorService) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.data && this.data) {
      this.setHistogramBars();
    }
  }

  public onLabelClick(label: string): void {
    this.labelClickable && this.labelClick.emit(label);
  }

  private setHistogramBars(): void {
    this.histogramBars = [];
    if (this.data.length === 0) {
      return;
    }

    let maxHistogramBarValue = maxBy(this.data, option => option.value)!.value;
    if (maxHistogramBarValue === 0) {
      maxHistogramBarValue = 1;
    }

    const colorLookupMap = this.buildColorLookupForData(this.data);

    this.histogramBars = this.data.map(
      (option): HistogramBarOptions => ({
        label: option.label,
        style: {
          backgroundColor: colorLookupMap.get(option.colorKey ?? option.label)!,
          width: `${Math.max((option.value / maxHistogramBarValue) * 100, 0.5)}%`
        },
        value: option.value
      })
    );
  }

  private buildColorLookupForData(barData: HistogramBarData[]): Map<string, string> {
    const uniqueDataValues = new Set(barData.map(data => data.colorKey ?? data.label));
    if (this.determineColor) {
      return new Map(Array.from(uniqueDataValues).map(value => [value, this.determineColor!(value)]));
    }

    const colors = this.colorService.getColorPalette().forNColors(uniqueDataValues.size);

    return new Map(Array.from(uniqueDataValues).map((value, index) => [value, colors[index]]));
  }
}
export interface HistogramBarData {
  label: string;
  value: number;
  colorKey?: string;
}

interface HistogramBarOptions extends HistogramBarData {
  style: HistogramBarStyle;
}

interface HistogramBarStyle {
  backgroundColor: string;
  width: string;
}
