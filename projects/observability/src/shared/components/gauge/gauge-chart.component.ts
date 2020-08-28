import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { maxBy } from 'lodash-es';
import { HistogramBarData } from '../histogram/histogram-chart.component';

@Component({
  selector: 'ht-gauge-chart',
  styleUrls: ['./gauge-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gauge-chart">
      <ng-container *ngFor="let item of this.itemOptions">
        <div class="border-top"></div>
        <div
          class="label"
          [htcTooltip]="item.label"
          (click)="this.onItemClick(item)"
          [ngClass]="{ clickable: this.labelClickable }"
          [ngStyle]="{ color: item.color }"
        >
          {{ item.label }}
        </div>
        <div class="progress">
          <div class="progress-value" [ngStyle]="{ width: item.width, backgroundColor: item.color }"></div>
        </div>
        <div class="value">
          <span>{{ item.value | htcDisplayNumber }}</span>
        </div>
      </ng-container>
    </div>
  `
})
export class GaugeChartComponent<T extends GaugeData = GaugeData> implements OnChanges {
  @Input()
  public data: T[] = [];

  @Input()
  public labelClickable: boolean = false;

  @Input()
  public determineColor?: (colorKey: string) => string;

  @Output()
  public readonly itemClick: EventEmitter<T> = new EventEmitter();

  public itemOptions: GaugeItemOption<T>[] = [];

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.data && this.data) {
      this.buildItemOptions();
    }
  }

  public onItemClick(item: GaugeItemOption<T>): void {
    this.labelClickable && this.itemClick.emit(item.original);
  }

  private buildItemOptions(): void {
    this.itemOptions = [];
    if (this.data.length === 0) {
      return;
    }

    let maxValue = maxBy(this.data, option => option.value)?.value;
    if (maxValue === undefined || maxValue === 0) {
      maxValue = 1;
    }

    const colorLookupMap = this.buildColorLookupForData(this.data);

    this.itemOptions = this.data.map(option => ({
      label: option.label,
      color: colorLookupMap?.get(option.colorKey ?? option.label),
      width: `${((option.value / maxValue!) * 100).toFixed(2)}%`,
      value: option.value,
      original: option
    }));
  }

  private buildColorLookupForData(barData: HistogramBarData[]): Map<string, string> | undefined {
    const uniqueDataValues = new Set(barData.map(data => data.colorKey ?? data.label));

    return this.determineColor
      ? new Map(Array.from(uniqueDataValues).map(value => [value, this.determineColor!(value)]))
      : undefined;
  }
}

export interface GaugeData {
  label: string;
  value: number;
  colorKey?: string;
}

interface GaugeItemOption<T extends GaugeData> extends GaugeData {
  width: string;
  color?: string;
  original: T;
}
