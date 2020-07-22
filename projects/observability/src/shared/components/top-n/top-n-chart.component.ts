import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { maxBy } from 'lodash-es';

@Component({
  selector: 'ht-top-n-chart',
  styleUrls: ['./top-n-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="top-n-chart">
      <ng-container *ngFor="let item of this.itemOptions">
        <div class="border-top"></div>
        <div
          class="label"
          [htcTooltip]="item.label"
          (click)="this.onItemClick(item)"
          [ngClass]="{ clickable: this.labelClickable }"
        >
          {{ item.label }}
        </div>
        <div class="progress">
          <div class="progress-value" [ngStyle]="{ width: item.width }"></div>
        </div>
        <div class="value">
          <span>{{ item.value | htcDisplayNumber }}</span>
        </div>
      </ng-container>
    </div>
  `
})
export class TopNChartComponent<T extends TopNData = TopNData> implements OnChanges {
  @Input()
  public data: T[] = [];

  @Input()
  public labelClickable: boolean = false;

  @Output()
  public readonly itemClick: EventEmitter<T> = new EventEmitter();

  public itemOptions: TopNItemOption<T>[] = [];

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.data && this.data) {
      this.buildItemOptions();
    }
  }

  public onItemClick(item: TopNItemOption<T>): void {
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

    this.itemOptions = this.data
      .sort((first, second) => second.value - first.value)
      .map(option => ({
        label: option.label,
        width: `${((option.value / maxValue!) * 100).toFixed(2)}%`,
        value: option.value,
        original: option
      }));
  }
}
export interface TopNData {
  label: string;
  value: number;
}

interface TopNItemOption<T extends TopNData> extends TopNData {
  width: string;
  original: T;
}
