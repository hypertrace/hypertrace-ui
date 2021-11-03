import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, TemplateRef, ViewChild } from '@angular/core';
import { IntervalDurationService, TimeDuration } from '@hypertrace/common';
import { InteractiveDataWidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { NEVER, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { CartesianSelectedData, LegendPosition } from '../../../../../public-api';
import { Band, Series } from '../../../../components/cartesian/chart';
import { IntervalValue } from '../../../../components/interval-select/interval-select.component';
import { CartesianDataFetcher, CartesianResult, CartesianWidgetModel } from './cartesian-widget.model';
import { ContextMenu } from './interactions/cartesian-explorer-context-menu/cartesian-explorer-context-menu.component';
import { IconType } from '@hypertrace/assets-library';
import {
  PopoverBackdrop,
  PopoverFixedPositionLocation,
  PopoverPositionType,
  PopoverRef,
  PopoverService
} from '@hypertrace/components';

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

    <ng-template #contextMenuTemplate>
      <ht-cartesian-explorer-context-menu
        [menus]="menus"
        (menuSelect)="contextMenuSelectHandler($event)"
      ></ht-cartesian-explorer-context-menu>
    </ng-template>
  `
})
export class CartesianWidgetRendererComponent<TSeriesInterval, TData> extends InteractiveDataWidgetRenderer<
  CartesianWidgetModel<any>,
  CartesianData<TSeriesInterval>
> {
  private popover?: PopoverRef;

  @ViewChild('contextMenuTemplate')
  private readonly contextMenuTemplate!: TemplateRef<unknown>;

  public constructor(
    @Inject(RENDERER_API) api: RendererApi<CartesianWidgetModel<TSeriesInterval>>,
    changeDetector: ChangeDetectorRef,
    private readonly intervalDurationService: IntervalDurationService,
    private readonly popoverService: PopoverService
  ) {
    super(api, changeDetector);
  }

  public menus: ContextMenu[] = [
    {
      name: 'Explore',
      icon: IconType.ArrowUpRight
    }
  ];

  private selectedData!: CartesianSelectedData<TData>;

  public selectedInterval?: IntervalValue;
  public intervalOptions?: IntervalValue[];
  private fetcher?: CartesianDataFetcher<TSeriesInterval>;

  public onIntervalChange(interval: IntervalValue): void {
    this.selectedInterval = interval;
    this.updateDataObservable();
  }

  public onSelectionChange(selectedData: CartesianSelectedData<TData>): void {
    if (this.model.legendPosition === LegendPosition.Bottom) {
      this.model.selectionHandler?.execute(selectedData);
    } else {
      this.selectedData = selectedData;
      this.showContextMenu();
    }
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

  private showContextMenu(): void {
    this.popover = this.popoverService.drawPopover({
      componentOrTemplate: this.contextMenuTemplate,
      data: this.contextMenuTemplate,
      position: {
        type: PopoverPositionType.Fixed,
        location: PopoverFixedPositionLocation.Right
      },
      backdrop: PopoverBackdrop.Transparent
    });
    this.popover.closeOnBackdropClick();
    this.popover.closeOnPopoverContentClick();
  }

  public contextMenuSelectHandler(_menu: ContextMenu): void {
    this.model.selectionHandler?.execute(this.selectedData);
  }
}

interface CartesianData<TSeriesInterval> {
  series: Series<TSeriesInterval>[];
  bands: Band<TSeriesInterval>[];
}
