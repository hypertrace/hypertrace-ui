import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { maxBy } from 'lodash-es';
import { HistogramBarData } from '../histogram/histogram-chart.component';

@Component({
  selector: 'ht-sort-n-chart',
  styleUrls: ['./sort-n-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sort-n-chart">
      <ng-container *ngFor="let item of this.itemOptions">
        <div class="border-top"></div>
        <div
          class="label"
          [htcTooltip]="item.label"
          (click)="this.onItemClick(item)"
          [ngClass]="{ clickable: this.itemClickable }"
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
export class SortNChartComponent<T extends SortNData = SortNData> implements OnChanges {
  @Input()
  public items: T[] = [];

  @Input()
  public itemClickable: boolean = false;

  @Input()
  public determineColor?: (colorKey: string) => string;

  @Output()
  public readonly itemClick: EventEmitter<T> = new EventEmitter();

  public itemOptions: SortItemOption<T>[] = [];

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.items && this.items) {
      this.buildItemOptions();
    }
  }

  public onItemClick(item: SortItemOption<T>): void {
    this.itemClickable && this.itemClick.emit(item.original);
  }

  private buildItemOptions(): void {
    this.itemOptions = [];
    if (this.items.length === 0) {
      return;
    }

    let maxValue = maxBy(this.items, option => option.value)?.value;
    if (maxValue === undefined || maxValue === 0) {
      maxValue = 1;
    }

    const colorLookupMap = this.buildColorLookupForData(this.items);

    this.itemOptions = this.items.map(option => ({
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

export interface SortNData {
  label: string;
  value: number;
  colorKey?: string;
}

interface SortItemOption<T extends SortNData> extends SortNData {
  width: string;
  color?: string;
  original: T;
}
