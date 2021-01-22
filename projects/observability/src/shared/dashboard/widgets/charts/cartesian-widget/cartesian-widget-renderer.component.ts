import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { IntervalDurationService, TimeDuration } from '@hypertrace/common';
import { InteractiveDataWidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Band, Series } from '../../../../components/cartesian/chart';
import { IntervalValue } from '../../../../components/interval-select/interval-select.component';
import { CartesianWidgetModel, MetricSeriesFetcher, SeriesResult } from './cartesian-widget.model';

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

  public onIntervalChange(interval: IntervalValue): void {
    this.selectedInterval = interval;
    this.updateDataObservable();
  }

  protected fetchData(): Observable<CartesianData<TData>> {
    return this.model.getSeriesFetcher().pipe(
      tap(seriesFetcher => {
        this.seriesFetcher = seriesFetcher;

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
    return this.seriesFetcher
      ? this.fetchCartesianData(this.seriesFetcher, this.selectedInterval).pipe(
          map(combinedData => ({
            series: [
              ...combinedData.map(d => d.series),
              ...combinedData.filter(d => d.band !== undefined).map(d => d.baseline!),
              ...combinedData.filter(d => d.band !== undefined).map(d => d.band?.upper!),
              ...combinedData.filter(d => d.band !== undefined).map(d => d.band?.lower!)
            ],
            bands: combinedData.filter(d => d.band !== undefined).map(d => d.band!)
          }))
        )
      : of();
  }

  private fetchCartesianData(
    fetcher: MetricSeriesFetcher<TData>,
    interval?: IntervalValue
  ): Observable<SeriesResult<TData>[]> {
    return fetcher.getData(this.resolveInterval(interval));
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

interface CartesianData<TInterval> {
  series: Series<TInterval>[];
  bands: Band<TInterval>[];
}
