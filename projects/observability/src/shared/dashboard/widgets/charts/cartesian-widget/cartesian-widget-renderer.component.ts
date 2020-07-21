import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { IntervalDurationService, TimeDuration } from '@hypertrace/common';
import { InteractiveDataWidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { NEVER, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Series } from '../../../../components/cartesian/chart';
import { IntervalValue } from '../../../../components/interval-select/interval-select.component';
import { CartesianWidgetModel, MetricSeriesFetcher } from './cartesian-widget.model';

@Renderer({ modelClass: CartesianWidgetModel })
@Component({
  selector: 'ht-cartesian-widget-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-titled-content *htcLoadAsync="this.data$ as data" [title]="this.model.title | htcDisplayTitle">
      <ht-cartesian-chart
        class="fill-container"
        [series]="data"
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
    </htc-titled-content>
  `
})
export class CartesianWidgetRendererComponent<TData> extends InteractiveDataWidgetRenderer<
  CartesianWidgetModel<TData>,
  Series<TData>[]
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
  private fetcher?: MetricSeriesFetcher<TData>;

  public onIntervalChange(interval: IntervalValue): void {
    this.selectedInterval = interval;
    this.updateDataObservable();
  }

  protected fetchData(): Observable<Series<TData>[]> {
    return this.model.getSeriesFetcher().pipe(
      tap(fetcher => {
        this.fetcher = fetcher;
        if (this.intervalSupported(fetcher)) {
          this.intervalOptions = this.buildIntervalOptions();
          this.selectedInterval = this.getBestIntervalMatch(
            this.intervalOptions,
            this.selectedInterval || fetcher.getRequestedInterval()
          );
        } else {
          this.intervalOptions = undefined;
          this.selectedInterval = undefined;
        }
      }),
      switchMap(() => this.buildDataObservable())
    );
  }

  protected buildDataObservable(): Observable<Series<TData>[]> {
    return this.fetcher ? this.buildSeries(this.fetcher, this.selectedInterval) : NEVER;
  }

  private buildSeries(fetcher: MetricSeriesFetcher<TData>, interval?: IntervalValue): Observable<Series<TData>[]> {
    return fetcher.getData(this.resolveInterval(interval));
  }

  private intervalSupported(fetcher: MetricSeriesFetcher<TData>): fetcher is Required<MetricSeriesFetcher<TData>> {
    return this.model.selectableInterval && !!fetcher.getRequestedInterval;
  }

  private resolveInterval(value?: IntervalValue): TimeDuration {
    return value instanceof TimeDuration ? value : this.intervalDurationService.getAutoDuration(this.timeRange, this.model.maxDataPoints);
  }

  private buildIntervalOptions(): IntervalValue[] {
    return ['AUTO', ...this.intervalDurationService.getAvailableIntervalsForTimeRange(this.timeRange, this.model.maxDataPoints)];
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
