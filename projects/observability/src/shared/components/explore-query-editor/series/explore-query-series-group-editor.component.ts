import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { ButtonRole, ButtonStyle } from '@hypertrace/components';
import { TraceType } from '@hypertrace/distributed-tracing';
import { without } from 'lodash';
import { ExploreSeries } from '../explore-visualization-builder';

@Component({
  selector: 'ht-explore-query-series-group-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./explore-query-series-group-editor.component.scss'],
  template: `
    <div class="section-header-container">
      <h3 class="section-header">Select metrics</h3>
      <htc-button
        class="add-series-button"
        icon="${IconType.Add}"
        role="${ButtonRole.Primary}"
        label="Add Metric"
        display="${ButtonStyle.Text}"
        (click)="this.onAddSeries()"
      ></htc-button>
    </div>
    <div class="series-container" *ngFor="let series of this.series; let isFirst = first; let index = index">
      <div class="series-index-indicator">
        <span class="series-index-indicator-text">{{ index + 1 }}</span>
      </div>
      <ht-explore-query-series-editor
        [series]="series"
        (seriesChange)="this.replaceSeries(series, $event)"
        [context]="this.context"
        [removable]="!isFirst"
        (removed)="this.onRemoveSeries(series)"
      >
      </ht-explore-query-series-editor>
    </div>
  `
})
export class ExploreQuerySeriesGroupEditorComponent {
  @Input()
  public series: ExploreSeries[] = [];

  @Input()
  public context?: TraceType;

  @Output()
  public readonly seriesChange: EventEmitter<ExploreSeries[]> = new EventEmitter();

  @Output()
  public readonly addSeries: EventEmitter<void> = new EventEmitter();

  public onAddSeries(): void {
    this.addSeries.emit();
  }

  public onRemoveSeries(seriesToRemove: ExploreSeries): void {
    this.seriesChange.emit(without(this.series, seriesToRemove));
  }

  public replaceSeries(oldSeries: ExploreSeries, newSeries: ExploreSeries): void {
    this.seriesChange.emit(this.series.map(series => (series === oldSeries ? newSeries : series)));
  }
}
