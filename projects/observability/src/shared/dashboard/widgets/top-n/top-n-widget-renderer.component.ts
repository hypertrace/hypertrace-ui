import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { forkJoinSafeEmpty, SubscriptionLifecycle } from '@hypertrace/common';
import { LoadAsyncConfig, LoaderType, SelectOption, SelectSize } from '@hypertrace/components';
import { InteractiveDataWidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { NEVER, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { GaugeItem } from '../../../components/gauge-list/gauge-list.component';
import { MetadataService } from '../../../services/metadata/metadata.service';
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
      <ht-titled-content
        [title]="this.model.header?.title | htDisplayTitle"
        [link]="this.model.header?.link?.url"
        [linkLabel]="this.model.header?.link?.displayText"
      >
        <ht-select
          *htTitledHeaderControl
          [selected]="this.metricSpecification"
          (selectedChange)="this.onSelection($event)"
          size="${SelectSize.Small}"
          htTooltip="Select Metric"
          class="metric-selector"
        >
          <ht-select-option
            *ngFor="let option of this.options$ | async"
            [value]="option.value"
            [label]="option.label"
          ></ht-select-option>
        </ht-select>
        <ht-gauge-list
          *htLoadAsync="this.data$ as data; config: this.dataLoaderConfig"
          [items]="data"
          [itemClickable]="true"
          (itemClick)="this.onItemClicked($event)"
        >
        </ht-gauge-list>
      </ht-titled-content>
    </div>
  `
})
export class TopNWidgetRendererComponent extends InteractiveDataWidgetRenderer<TopNWidgetModel, GaugeItem[]> {
  public readonly dataLoaderConfig: LoadAsyncConfig = { load: { loaderType: LoaderType.TableRow } };
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

  protected fetchData(): Observable<GaugeItem[]> {
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

  protected buildDataObservable(): Observable<GaugeItem[]> {
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
