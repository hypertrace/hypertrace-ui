import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { GaugeData } from '../gauge/gauge-chart.component';

@Component({
  selector: 'ht-top-n-chart',
  styleUrls: ['./top-n-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="top-n-chart">
      <ht-gauge-chart
        [data]="this.sortedData"
        [labelClickable]="this.labelClickable"
        (itemClick)="this.itemClick.emit($event)"
      ></ht-gauge-chart>
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

  public sortedData: T[] = [];

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.data && this.data) {
      this.buildSortedData();
    }
  }

  private buildSortedData(): void {
    this.sortedData = [];
    if (this.data.length === 0) {
      return;
    }

    this.sortedData = this.data.sort((first, second) => second.value - first.value);
  }
}

export type TopNData = GaugeData;
