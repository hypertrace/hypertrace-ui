import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { forkJoinSafeEmpty, IntervalDurationService, TimeDuration } from '@hypertrace/common';
import { InteractiveDataWidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Band, Series } from '../../../../components/cartesian/chart';
import { IntervalValue } from '../../../../components/interval-select/interval-select.component';
import {
  MetricTimeseriesBandInterval, MetricTimeseriesInterval
} from '../../../../graphql/model/metric/metric-timeseries';
import {
  BandResult,
  CartesianWidgetModel,
  MetricBandFetcher,
  MetricSeriesFetcher,
  SeriesResult
} from './cartesian-widget.model';

@Renderer({ modelClass: CartesianWidgetModel })
@Component({
  selector: 'ht-cartesian-widget-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-titled-content *htLoadAsync="this.data$ as data" [title]="this.model.title | htDisplayTitle">
      <ht-cartesian-chart
        class="fill-container"
        [series]="data.series"
        [bands]="data.bands"
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
export class CartesianWidgetRendererComponent<TSeriesInterval> extends InteractiveDataWidgetRenderer<
  CartesianWidgetModel<TSeriesInterval>,
  CartesianData<TSeriesInterval, MetricTimeseriesBandInterval>
> {
  public constructor(
    @Inject(RENDERER_API) api: RendererApi<CartesianWidgetModel<TSeriesInterval>>,
    changeDetector: ChangeDetectorRef,
    private readonly intervalDurationService: IntervalDurationService
  ) {
    super(api, changeDetector);
  }

  public selectedInterval?: IntervalValue;
  public intervalOptions?: IntervalValue[];
  private seriesFetcher?: MetricSeriesFetcher<TSeriesInterval>;
  private bandFetcher?: MetricBandFetcher<MetricTimeseriesInterval>;

  public onIntervalChange(interval: IntervalValue): void {
    this.selectedInterval = interval;
    this.updateDataObservable();
  }

  protected fetchData(): Observable<CartesianData<TSeriesInterval, MetricTimeseriesBandInterval>> {
    return forkJoinSafeEmpty({
      seriesFetcher: this.model.getSeriesFetcher(),
      bandFetcher: this.model.getBandsFetcher()
    }).pipe(
      tap(fetchers => {
        this.seriesFetcher = fetchers.seriesFetcher;
        this.bandFetcher = fetchers.bandFetcher;

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

  protected buildDataObservable(): Observable<CartesianData<TSeriesInterval, MetricTimeseriesBandInterval>> {
    return forkJoinSafeEmpty({
      seriesResult: this.seriesFetcher
        ? this.fetchCartesianSeriesData(this.seriesFetcher, this.selectedInterval)
        : of([]),
      bandResult: this.bandFetcher ? this.fetchCartesianBandData(this.bandFetcher, this.selectedInterval) : of([])
    }).pipe(
      map((combinedResults: CombinedResults<TSeriesInterval>) => ({
        series: [
          ...combinedResults.seriesResult.map(r => r.series),
          /*
           * This is a little kludgy and not entirely type safe, but safe...ish because we can make some assumptions.
           *
           * The assumption being that if we are plotting a series and bands on the same chart, the intervals will have
           * the same shape. Since we already know the shape all bands take, we assume the series is also in the form
           * of a timestamp and value (and maybe additional properties).
           *
           * With those assumptions in mind, prepare yourself for some ugly casting below.
           */
          ...combinedResults.bandResult
            .map(result => result.baseline as unknown)
            .map(baseline => baseline as Series<TSeriesInterval>)
        ],
        bands: [...combinedResults.bandResult.map(r => r.band)]
      }))
    );
  }

  private fetchCartesianSeriesData(
    fetcher: MetricSeriesFetcher<TSeriesInterval>,
    interval?: IntervalValue
  ): Observable<SeriesResult<TSeriesInterval>[]> {
    return fetcher.getData(this.resolveInterval(interval));
  }

  private fetchCartesianBandData(
    fetcher: MetricBandFetcher<MetricTimeseriesInterval>,
    interval?: IntervalValue
  ): Observable<BandResult<MetricTimeseriesInterval>[]> {
    return fetcher.getData(this.resolveInterval(interval));
  }

  private intervalSupported(
    fetcher: MetricSeriesFetcher<TSeriesInterval>
  ): fetcher is Required<MetricSeriesFetcher<TSeriesInterval>> {
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

interface CartesianData<TSeriesInterval, TBandInterval> {
  series: Series<TSeriesInterval>[];
  bands: Band<TBandInterval>[];
}

interface CombinedResults<TSeriesInterval> {
  seriesResult: SeriesResult<TSeriesInterval>[];
  bandResult: BandResult<MetricTimeseriesInterval>[];
}
