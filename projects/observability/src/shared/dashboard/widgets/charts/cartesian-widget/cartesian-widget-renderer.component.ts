import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { IntervalDurationService, TimeDuration } from '@hypertrace/common';
import { InteractiveDataWidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { NEVER, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Band, Series } from '../../../../components/cartesian/chart';
import { IntervalValue } from '../../../../components/interval-select/interval-select.component';
import { CartesianDataFetcher, CartesianResult, CartesianWidgetModel } from './cartesian-widget.model';

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
        (selectionChange)="this.onSelectionChange($event)"
      >
      </ht-cartesian-chart>
    </ht-titled-content>
  `
})
export class CartesianWidgetRendererComponent<TSeriesInterval> extends InteractiveDataWidgetRenderer<
  CartesianWidgetModel<TSeriesInterval>,
  CartesianData<TSeriesInterval>
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
  private fetcher?: CartesianDataFetcher<TSeriesInterval>;

  public onIntervalChange(interval: IntervalValue): void {
    this.selectedInterval = interval;
    this.updateDataObservable();
  }

  public onSelectionChange(data: any): void {
    this.model.selectionHandler?.execute(data);
  }

  protected fetchData(): Observable<CartesianData<TSeriesInterval>> {
    return this.model.getDataFetcher().pipe(
      tap(fetcher => {
        this.fetcher = fetcher;
        const defaultInterval = this.model.defaultInterval?.getDuration();
        const intervalOptions = this.buildIntervalOptions();

        if (this.intervalSupported()) {
          this.selectedInterval = this.getBestIntervalMatch(intervalOptions, this.selectedInterval ?? defaultInterval);
          this.intervalOptions = intervalOptions; // The only thing this flag controls is whether options are available (and thus, the selector)
        } else {
          this.selectedInterval = this.getBestIntervalMatch(intervalOptions, defaultInterval);
        }
      }),
      switchMap(() => this.buildDataObservable())
    );
  }

  protected buildDataObservable(): Observable<CartesianData<TSeriesInterval>> {
    if (!this.fetcher) {
      return NEVER;
    }

    return this.fetchCartesianData(this.fetcher, this.selectedInterval);
  }

  private fetchCartesianData(
    fetcher: CartesianDataFetcher<TSeriesInterval>,
    interval?: IntervalValue
  ): Observable<CartesianResult<TSeriesInterval>> {
    return fetcher.getData(this.resolveInterval(interval));
  }

  private intervalSupported(): boolean {
    return this.model.selectableInterval;
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

interface CartesianData<TSeriesInterval> {
  series: Series<TSeriesInterval>[];
  bands: Band<TSeriesInterval>[];
}
