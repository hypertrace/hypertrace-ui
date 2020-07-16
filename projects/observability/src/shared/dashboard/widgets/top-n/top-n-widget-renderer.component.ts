import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { forkJoinSafeEmpty, SubscriptionLifecycle } from '@hypertrace/common';
import { SelectOption, SelectSize } from '@hypertrace/components';
import { InteractiveDataWidgetRenderer } from '@hypertrace/dashboards';
import { MetadataService } from '@hypertrace/distributed-tracing';
import { Renderer } from '@hypertrace/hyperdash';
import { RENDERER_API, RendererApi } from '@hypertrace/hyperdash-angular';
import { NEVER, Observable } from 'rxjs';
import { flatMap, map, switchMap, tap } from 'rxjs/operators';
import { EntityNavigationService } from '../../../services/navigation/entity/entity-navigation.service';
import { MetricAggregationSpecificationModel } from '../../data/graphql/specifiers/metric-aggregation-specification.model';
import { TopNEntityData, TopNWidgetData, TopNWidgetDataFetcher } from './data/top-n-data-source.model';
import { TopNWidgetModel } from './top-n-widget.model';

@Renderer({ modelClass: TopNWidgetModel })
@Component({
  selector: 'ht-top-n-widget-renderer',
  styleUrls: ['./top-n-widget-renderer.component.scss'],
  providers: [SubscriptionLifecycle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-top-n-widget-renderer">
      <htc-titled-content
        [title]="this.model.header?.title | htcDisplayTitle"
        [link]="this.model.header?.link?.url"
        [linkLabel]="this.model.header?.link?.displayText"
      >
        <htc-select
          *htcTitledHeaderControl
          [selected]="this.metricSpecification"
          (selectedChange)="this.onSelection($event)"
          size="${SelectSize.Small}"
          htcTooltip="Select Metric"
          class="metric-selector"
        >
          <htc-select-option
            *ngFor="let option of this.options$ | async"
            [value]="option.value"
            [label]="option.label"
          ></htc-select-option>
        </htc-select>
        <ht-top-n-chart
          *htcLoadAsync="this.data$ as data"
          [totalValue]="data.totalValue"
          [data]="data.topNData"
          [labelClickable]="true"
          (labelClick)="this.onLabelClicked($event, data.topNData)"
        >
        </ht-top-n-chart>
      </htc-titled-content>
    </div>
  `
})
export class TopNWidgetRendererComponent extends InteractiveDataWidgetRenderer<TopNWidgetModel, TopNWidgetData> {
  public metricSpecification!: MetricAggregationSpecificationModel;
  public options$!: Observable<SelectOption<MetricAggregationSpecificationModel>[]>;
  private fetcher?: TopNWidgetDataFetcher;

  public constructor(
    @Inject(RENDERER_API) api: RendererApi<TopNWidgetModel>,
    changeDetector: ChangeDetectorRef,
    private readonly metadataService: MetadataService,
    private readonly entityNavService: EntityNavigationService
  ) {
    super(api, changeDetector);
    this.setInitialMetricSpecification();
    this.setOptionsObservables();
  }

  public onSelection(metricSpecification: MetricAggregationSpecificationModel): void {
    this.metricSpecification = metricSpecification;
    this.updateDataObservable();
  }

  public onLabelClicked(label: string, topNData: TopNEntityData[]): void {
    const topNDatum = topNData.find(datum => datum.label === label);
    if (topNDatum) {
      this.entityNavService.navigateToEntity(topNDatum.entity);
    }
  }

  protected fetchData(): Observable<TopNWidgetData> {
    return this.model.getData().pipe(
      tap(fetcher => (this.fetcher = fetcher)),
      switchMap(() => this.buildDataObservable())
    );
  }

  protected buildDataObservable(): Observable<TopNWidgetData> {
    return this.fetcher ? this.fetcher.getData(this.metricSpecification) : NEVER;
  }

  private setOptionsObservables(): void {
    this.options$ = this.model.getData().pipe(
      map(fetcher => fetcher.scope),
      flatMap(scope =>
        forkJoinSafeEmpty(
          this.model.optionMetricSpecifications.map(specification =>
            this.metadataService
              .getSpecificationDisplayName(scope, specification)
              .pipe(map(label => ({ label: label, value: specification })))
          )
        )
      )
    );
  }

  private setInitialMetricSpecification(): void {
    this.metricSpecification = this.model.optionMetricSpecifications[0];
  }
}
