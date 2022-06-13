import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { maxBy, sum } from 'lodash-es';

@Component({
  selector: 'ht-gauge-list',
  styleUrls: ['./gauge-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gauge-list" [ngClass]="{ 'with-label': this.showLabels }">
      <ng-container *ngFor="let item of this.itemOptions">
        <div class="border-top" *ngIf="this.showItemBorders"></div>
        <div
          class="label"
          *ngIf="this.showLabels"
          [htTooltip]="item.label"
          (click)="this.onItemClick(item)"
          [ngClass]="{ clickable: this.itemClickable }"
          [ngStyle]="{ color: item.color }"
        >
          {{ item.label }}
        </div>
        <div class="progress" [htTooltip]="item.label">
          <div class="progress-value" [ngStyle]="{ width: item.width, backgroundColor: item.color }"></div>
        </div>
        <div class="value">
          <span>{{ item.value | htDisplayNumber }}</span>
          <span *ngIf="this.showPercentages"> ({{ item.percentage | htDisplayNumber }}%)</span>
        </div>
      </ng-container>
    </div>
  `
})
export class GaugeListComponent<T extends GaugeItem = GaugeItem> implements OnChanges {
  @Input()
  public items: T[] = [];

  @Input()
  public itemClickable: boolean = false;

  @Input()
  public determineColor?: (colorKey: string) => string;

  @Input()
  public showLabels: boolean = true;

  @Input()
  public showPercentages: boolean = false;

  @Input()
  public showItemBorders: boolean = true;

  @Input()
  public total?: number;

  @Output()
  public readonly itemClick: EventEmitter<T> = new EventEmitter();

  public itemOptions: GaugeItemOption<T>[] = [];

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.items && this.items) {
      this.buildItemOptions();
    }
  }

  public onItemClick(item: GaugeItemOption<T>): void {
    this.itemClickable && this.itemClick.emit(item.original);
  }

  private buildItemOptions(): void {
    this.itemOptions = [];
    if (this.items.length === 0) {
      return;
    }

    if (this.total !== undefined && this.total !== 0) {
      this.setItemOptions(this.items, this.total, this.total);
    } else {
      let maxValue = maxBy(this.items, option => option.value)?.value;

      if (maxValue === undefined || maxValue === 0) {
        maxValue = 1;
      }

      const totalCount = sum(this.items.map((gaugeItem: GaugeItem) => gaugeItem.value));

      this.setItemOptions(this.items, maxValue, totalCount);
    }
  }

  private setItemOptions(items: T[], fullValue: number, totalCount: number) {
    const colorLookupMap = this.buildColorLookupForData(this.items);

    this.itemOptions = items.map(option => ({
      label: option.label,
      color: colorLookupMap.get(option.colorKey ?? option.label),
      width: `${((option.value / fullValue!) * 100).toFixed(2)}%`,
      value: option.value,
      percentage: totalCount > 0 ? (option.value / totalCount) * 100 : 100,
      original: option
    }));
  }

  private buildColorLookupForData(barData: GaugeItem[]): Map<string, string> {
    const uniqueDataValues = new Set(barData.map(data => data.colorKey ?? data.label));

    return this.determineColor
      ? new Map(Array.from(uniqueDataValues).map(value => [value, this.determineColor!(value)]))
      : new Map();
  }
}

export interface GaugeItem {
  label: string;
  value: number;
  percentage?: number;
  colorKey?: string;
}

interface GaugeItemOption<T extends GaugeItem> extends GaugeItem {
  width: string;
  color?: string;
  original: T;
}
