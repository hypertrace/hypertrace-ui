import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { forkJoinSafeEmpty, SubscriptionLifecycle } from '@hypertrace/common';
import { SelectOption, SelectSize } from '@hypertrace/components';
import { InteractiveDataWidgetRenderer } from '@hypertrace/dashboards';
import { MetadataService } from '@hypertrace/distributed-tracing';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { NEVER, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { SortNData } from '../../../components/gauge-list/gauge-list.component';
import { EntityNavigationService } from '../../../services/navigation/entity/entity-navigation.service';
import { TopNWidgetDataFetcher, TopNWidgetValueData } from './data/top-n-data-source.model';
import { TopNExploreSelectionSpecificationModel } from './data/top-n-explore-selection-specification.model';
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
        <ht-gauge-list
          *htcLoadAsync="this.data$ as data"
          [items]="data"
          [itemClickable]="true"
          (itemClick)="this.onItemClicked($event)"
        >
        </ht-gauge-list>
      </htc-titled-content>
    </div>
  `
})
export class TopNWidgetRendererComponent extends InteractiveDataWidgetRenderer<TopNWidgetModel, SortNData[]> {
  public metricSpecification!: TopNExploreSelectionSpecificationModel;
  public options$!: Observable<SelectOption<TopNExploreSelectionSpecificationModel>[]>;
  private fetcher?: TopNWidgetDataFetcher;

  public constructor(
    @Inject(RENDERER_API) api: RendererApi<TopNWidgetModel>,
    changeDetector: ChangeDetectorRef,
    private readonly metadataService: MetadataService,
    private readonly entityNavService: EntityNavigationService
  ) {
    super(api, changeDetector);
  }

  public onSelection(metricSpecification: TopNExploreSelectionSpecificationModel): void {
    this.metricSpecification = metricSpecification;
    this.updateDataObservable();
  }

  public onItemClicked(item: TopNWidgetValueData): void {
    this.entityNavService.navigateToEntity(item.entity);
  }

  protected fetchData(): Observable<SortNData[]> {
    return this.model.getData().pipe(
      tap(fetcher => {
        this.fetcher = fetcher;
        this.setInitialMetricSpecification(fetcher);
        this.setOptionsObservables(fetcher);
      }),
      switchMap(() => this.buildDataObservable()),
      map(data => data.sort((first, second) => second.value - first.value))
    );
  }

  protected buildDataObservable(): Observable<SortNData[]> {
    return this.fetcher ? this.fetcher.getData(this.metricSpecification) : NEVER;
  }

  private setOptionsObservables(fetcher: TopNWidgetDataFetcher): void {
    this.options$ = forkJoinSafeEmpty(
      fetcher
        .getOptions()
        .map(spec =>
          this.metadataService
            .getSpecificationDisplayName(spec.context, spec.metric)
            .pipe(map(label => ({ label: label, value: spec })))
        )
    );
  }

  private setInitialMetricSpecification(fetcher: TopNWidgetDataFetcher): void {
    this.metricSpecification = fetcher.getOptions()[0];
  }
}
