import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { forkJoinSafeEmpty, IntervalDurationService, TimeDuration } from '@hypertrace/common';
import { InteractiveDataWidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Range, Series } from '../../../../components/cartesian/chart';
import { IntervalValue } from '../../../../components/interval-select/interval-select.component';
import { CartesianWidgetModel, MetricSeriesFetcher } from './cartesian-widget.model';

@Renderer({ modelClass: CartesianWidgetModel })
@Component({
  selector: 'ht-cartesian-widget-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-titled-content *htLoadAsync="this.data$ as data" [title]="this.model.title | htDisplayTitle">
      <ht-cartesian-chart
        class="fill-container"
        [series]="data.series"
        [range]="data.range"
        [xAxisOption]="this.model.xAxis && this.model.xAxis!.getAxisOption()"
        [yAxisOption]="this.model.yAxis && this.model.yAxis!.getAxisOption()"
        [showXAxis]="this.model.showXAxis"
        [showYAxis]="this.model.showYAxis"
        [timeRange]="this.timeRange"
        [selectedInterval]="this.selectedInterval"
        [intervalOptions]="this.intervalOptions"
        [legend]="this.model.legendPosition"
        (selectedIntervalChange)="this.onIntervalChange($event)"
      >
      </ht-cartesian-chart>
    </ht-titled-content>
  `
})
export class CartesianWidgetRendererComponent<TData> extends InteractiveDataWidgetRenderer<
  CartesianWidgetModel<TData>,
  CartesianData<TData>
> {
  public constructor(
    @Inject(RENDERER_API) api: RendererApi<CartesianWidgetModel<TData>>,
    changeDetector: ChangeDetectorRef,
    private readonly intervalDurationService: IntervalDurationService
  ) {
    super(api, changeDetector);
  }

  public selectedInterval?: IntervalValue;
  public intervalOptions?: IntervalValue[];
  private seriesFetcher?: MetricSeriesFetcher<TData>;
  private rangeFetcher?: MetricSeriesFetcher<TData>;

  public onIntervalChange(interval: IntervalValue): void {
    this.selectedInterval = interval;
    this.updateDataObservable();
  }

  protected fetchData(): Observable<CartesianData<TData>> {
    return forkJoinSafeEmpty({
      seriesFetcher: this.model.getSeriesFetcher(),
      rangeFetcher: this.model.getRangeFetcher()
    }).pipe(
      tap(fetcherObj => {
        this.seriesFetcher = fetcherObj.seriesFetcher;
        this.rangeFetcher = fetcherObj.rangeFetcher;
        if (this.intervalSupported(this.seriesFetcher)) {
          this.intervalOptions = this.buildIntervalOptions();
          this.selectedInterval = this.getBestIntervalMatch(
            this.intervalOptions,
            this.selectedInterval || this.seriesFetcher.getRequestedInterval()
          );
        } else {
          this.intervalOptions = undefined;
          this.selectedInterval = undefined;
        }
      }),
      switchMap(() => this.buildDataObservable())
    );
  }

  protected buildDataObservable(): Observable<CartesianData<TData>> {
    return forkJoinSafeEmpty({
      series: this.seriesFetcher ? this.buildSeries(this.seriesFetcher, this.selectedInterval) : of([]),
      range: this.rangeFetcher ? this.buildRange(this.rangeFetcher, this.selectedInterval) : of(undefined)
    });
  }

  private buildSeries(fetcher: MetricSeriesFetcher<TData>, interval?: IntervalValue): Observable<Series<TData>[]> {
    return fetcher.getData(this.resolveInterval(interval));
  }

  private buildRange(fetcher: MetricSeriesFetcher<TData>, interval?: IntervalValue): Observable<Range<TData>> {
    return fetcher.getData(this.resolveInterval(interval)).pipe(
      map(series => ({
        name: this.model.range!.name,
        color: this.model.range!.color,
        opacity: this.model.range!.opacity,
        upper: series[0],
        lower: series[1]
      }))
    );
  }

  private intervalSupported(fetcher: MetricSeriesFetcher<TData>): fetcher is Required<MetricSeriesFetcher<TData>> {
    return this.model.selectableInterval && !!fetcher.getRequestedInterval;
  }

  private resolveInterval(value?: IntervalValue): TimeDuration {
    return value instanceof TimeDuration
      ? value
      : this.intervalDurationService.getAutoDuration(this.timeRange, this.model.maxSeriesDataPoints);
  }

  private buildIntervalOptions(): IntervalValue[] {
    return [
      'AUTO',
      ...this.intervalDurationService.getAvailableIntervalsForTimeRange(this.timeRange, this.model.maxSeriesDataPoints)
    ];
  }

  private getBestIntervalMatch(options: IntervalValue[], request: IntervalValue = 'AUTO'): IntervalValue {
    const match =
      request instanceof TimeDuration &&
      this.intervalDurationService.getExactMatch(
        request,
        options.filter((option): option is TimeDuration => option instanceof TimeDuration)
      );

    return match || 'AUTO';
  }
}

interface CartesianData<TData> {
  series: Series<TData>[];
  range?: Range<TData> | undefined;
}
