import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { sortBy } from 'lodash';
import { HistogramBarData } from '../histogram/histogram-chart.component';

@Component({
  selector: 'ht-top-n-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-histogram-chart
      [data]="this.histogramData"
      [labelClickable]="this.labelClickable"
      (labelClick)="this.onLabelClick($event)"
    >
    </ht-histogram-chart>
  `
})
export class TopNChartComponent implements OnChanges {
  @Input()
  public data: TopNData[] = [];

  @Input()
  public labelClickable: boolean = false;

  @Output()
  public readonly labelClick: EventEmitter<string> = new EventEmitter();

  public histogramData: HistogramBarData[] = [];

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.data && this.data) {
      this.histogramData = sortBy(this.data, option => -option.value);
    }
  }

  public onLabelClick(label: string): void {
    this.labelClickable && this.labelClick.emit(label);
  }
}

export type TopNData = HistogramBarData;
