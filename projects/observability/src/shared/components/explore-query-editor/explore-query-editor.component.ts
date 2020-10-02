import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { Filter } from '@hypertrace/components';
import { Observable } from 'rxjs';
import { GraphQlGroupBy } from '../../graphql/model/schema/groupby/graphql-group-by';
import { IntervalValue } from '../interval-select/interval-select.component';
import {
  ExploreRequestContext,
  ExploreSeries,
  ExploreVisualizationBuilder,
  ExploreVisualizationRequest
} from './explore-visualization-builder';

@Component({
  selector: 'ht-explore-query-editor',
  styleUrls: ['./explore-query-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ExploreVisualizationBuilder],
  template: `
    <div *ngIf="this.visualizationRequest$ | async as currentVisualization" class="query-editor">
      <ht-explore-query-series-group-editor
        class="series-level-config"
        [series]="currentVisualization.series"
        [context]="currentVisualization.context"
        (seriesChange)="this.setSeries($event)"
        (addSeries)="this.addSeries()"
      ></ht-explore-query-series-group-editor>

      <div class="divider-container">
        <div class="divider"></div>
      </div>

      <div class="query-level-config">
        <ht-explore-query-interval-editor
          class="interval"
          [interval]="currentVisualization.interval"
          (intervalChange)="this.setInterval($event)"
        ></ht-explore-query-interval-editor>
        <ht-explore-query-group-by-editor
          class="group-by"
          [context]="currentVisualization.context"
          [groupByKey]="(currentVisualization.groupBy?.keys)[0]"
          (groupByKeyChange)="this.updateGroupByKey(currentVisualization.groupBy, $event)"
        ></ht-explore-query-group-by-editor>

        <ht-explore-query-limit-editor
          class="limit"
          [limit]="currentVisualization.groupByLimit"
          (limitChange)="this.setLimit($event)"
          [includeRest]="currentVisualization.groupBy?.includeRest"
          (includeRestChange)="this.updateGroupByIncludeRest(currentVisualization.groupBy!, $event)"
          [disabled]="!currentVisualization.groupBy"
        >
        </ht-explore-query-limit-editor>
      </div>
    </div>
  `
})
export class ExploreQueryEditorComponent implements OnChanges, OnInit {
  @Input()
  public filters?: Filter[];

  @Input()
  public context?: ExploreRequestContext;

  @Output()
  public readonly visualizationRequestChange: EventEmitter<ExploreVisualizationRequest> = new EventEmitter();

  public readonly visualizationRequest$: Observable<ExploreVisualizationRequest>;

  public constructor(private readonly visualizationBuilder: ExploreVisualizationBuilder) {
    this.visualizationRequest$ = visualizationBuilder.visualizationRequest$;
  }

  public ngOnInit(): void {
    this.visualizationRequest$.subscribe(query => this.visualizationRequestChange.emit(query));
  }

  public ngOnChanges(changeObject: TypedSimpleChanges<this>): void {
    if (changeObject.context) {
      this.visualizationBuilder.context(this.context);
    }

    if (changeObject.filters) {
      this.visualizationBuilder.filters(this.filters);
    }
  }

  public setSeries(series: ExploreSeries[]): void {
    this.visualizationBuilder.setSeries(series);
  }

  public updateGroupByKey(groupBy?: GraphQlGroupBy, key?: string): void {
    if (key === undefined) {
      this.visualizationBuilder.groupBy();
    } else {
      this.visualizationBuilder.groupBy(groupBy ? { ...groupBy, keys: [key] } : { keys: [key] });
    }
  }

  public updateGroupByIncludeRest(groupBy: GraphQlGroupBy, includeRest: boolean): void {
    this.visualizationBuilder.groupBy({ ...groupBy, includeRest: includeRest });
  }

  public setLimit(limit: number): void {
    this.visualizationBuilder.groupByLimit(limit);
  }

  public setInterval(interval: IntervalValue): void {
    this.visualizationBuilder.interval(interval === 'NONE' ? undefined : interval);
  }

  public addSeries(): void {
    this.visualizationBuilder.addNewSeries();
  }
}
