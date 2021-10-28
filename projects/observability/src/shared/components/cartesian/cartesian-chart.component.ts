import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  Renderer2,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { DateCoercer, DateFormatter, TimeRange } from '@hypertrace/common';
import {
  PopoverBackdrop,
  PopoverPositionType,
  PopoverRef,
  PopoverRelativePositionLocation,
  PopoverService
} from '@hypertrace/components';
import { defaults } from 'lodash-es';
import { ContextMenu } from '../../dashboard/widgets/charts/cartesian-widget/interactions/cartesian-explorer-context-menu/cartesian-explorer-context-menu.component';
import { IntervalValue } from '../interval-select/interval-select.component';
import { LegendPosition } from '../legend/legend.component';
import { ChartTooltipBuilderService } from '../utils/chart-tooltip/chart-tooltip-builder.service';
import { DefaultChartTooltipRenderData } from '../utils/chart-tooltip/default/default-chart-tooltip.component';
import { MouseLocationData } from '../utils/mouse-tracking/mouse-tracking';
import { Axis, AxisLocation, AxisType, Band, CartesianChart, RenderingStrategy, Series } from './chart';
import { ChartBuilderService } from './chart-builder.service';
import { ChartEvent } from './chart-interactivty';
import { defaultXDataAccessor, defaultYDataAccessor } from './d3/scale/default-data-accessors';

@Component({
  selector: 'ht-cartesian-chart',
  styleUrls: ['./cartesian-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #chartContainer class="fill-container" (htLayoutChange)="this.redraw()"></div>
    <ng-template #contextMenuTemplate>
      <ht-cartesian-explorer-context-menu
        [menus]="menus"
        (menuSelect)="contextMenuSelectHandler($event)"
      ></ht-cartesian-explorer-context-menu>
    </ng-template> `
})
export class CartesianChartComponent<TData> implements OnChanges, OnDestroy {
  @Input()
  public series?: Series<TData>[] = [];

  @Input()
  public bands?: Band<TData>[] = [];

  @Input()
  public xAxisOption?: Axis;

  @Input()
  public yAxisOption?: Axis;

  @Input()
  public showYAxis?: boolean = false;

  @Input()
  public showXAxis?: boolean = true;

  @Input()
  public legend?: LegendPosition = LegendPosition.TopRight;

  @Input()
  public strategy: RenderingStrategy = RenderingStrategy.Auto;

  @Input()
  public timeRange?: TimeRange;

  @Input()
  public intervalOptions?: IntervalValue[];

  @Input()
  public selectedInterval?: IntervalValue;

  @Output()
  public readonly selectedIntervalChange: EventEmitter<IntervalValue> = new EventEmitter();

  @Output()
  public readonly selectionChange: EventEmitter<
    MouseLocationData<TData, Series<TData> | Band<TData>>[]
  > = new EventEmitter();

  @ViewChild('chartContainer', { static: true })
  public readonly container!: ElementRef;

  private popover?: PopoverRef;

  @ViewChild('contextMenuTemplate')
  private readonly contextMenuTemplate!: TemplateRef<unknown>;

  private chart?: CartesianChart<TData>;
  private readonly dateCoercer: DateCoercer = new DateCoercer();
  private readonly dateFormatter: DateFormatter = new DateFormatter();

  private selectedData!: MouseLocationData<TData, Series<TData> | Band<TData>>[];

  public menus: ContextMenu[] = [
    {
      name: 'Explore',
      icon: IconType.ArrowUpRight
    }
  ];

  public constructor(
    private readonly chartBuilderService: ChartBuilderService,
    private readonly chartTooltipBuilderService: ChartTooltipBuilderService,
    private readonly renderer: Renderer2,
    private readonly popoverService: PopoverService
  ) {}

  public ngOnChanges(): void {
    // TODO reuse chart if possible
    this.chart && this.chart.destroy();

    if (!this.series) {
      // Setting series through an observable would assign it a null/undefined value
      return;
    }

    this.chart = this.chartBuilderService
      .build<TData>(this.strategy, this.container.nativeElement, this.renderer)
      .withSeries(...this.series)
      .withTooltip(
        this.chartTooltipBuilderService.constructTooltip<TData, Series<TData>>(data =>
          this.convertToDefaultTooltipRenderData(data)
        )
      )
      .withEventListener(ChartEvent.Select, selectedData => {
        this.selectedData = selectedData;
        if (this.legend === LegendPosition.Bottom) {
          this.selectionChange.emit(this.selectedData);
        } else {
          this.showContextMenu();
        }
      });

    if (this.bands) {
      this.chart.withBands(...this.bands);
    }

    if (this.showXAxis) {
      this.chart.withAxis(this.getXAxis());
    }

    if (this.showYAxis) {
      this.chart.withAxis(this.getYAxis());
    }

    if (this.timeRange !== undefined) {
      this.chart.withTimeRange(this.timeRange);
    }

    if (this.legend !== undefined) {
      this.chart.withLegend(this.legend);
    }

    if (this.intervalOptions !== undefined && this.selectedInterval !== undefined) {
      this.chart.withIntervalData({
        initial: this.selectedInterval,
        options: this.intervalOptions,
        changeObserver: this.selectedIntervalChange
      });
    }

    setTimeout(() => {
      // Give time for dom to size container
      this.chart && this.chart.draw();
    });
  }

  public ngOnDestroy(): void {
    this.chart && this.chart.destroy();
  }

  public redraw(): void {
    this.chart && this.chart.isDrawn() && this.chart.draw();
  }

  private getXAxis(): Axis {
    return defaults(this.xAxisOption, {
      type: AxisType.X,
      location: AxisLocation.Bottom,
      axisLine: true,
      gridLines: true,
      crosshair: {
        snap: true
      }
    });
  }

  private getYAxis(): Axis {
    return defaults(this.yAxisOption, {
      type: AxisType.Y,
      location: AxisLocation.Left,
      tickLabels: true,
      axisLine: false
    });
  }

  private convertToDefaultTooltipRenderData(
    data: MouseLocationData<TData, Series<TData>>[]
  ): DefaultChartTooltipRenderData | undefined {
    if (data.length === 0) {
      return undefined;
    }

    return {
      title: this.resolveTooltipTitle(data[0]),
      labeledValues: data.map(singleValue => ({
        label: singleValue.context.name,
        value: defaultYDataAccessor<number | string>(singleValue.dataPoint),
        units: singleValue.context.units,
        color: singleValue.context.getColor?.(singleValue.dataPoint) ?? singleValue.context.color
      }))
    };
  }

  private resolveTooltipTitle(location: MouseLocationData<TData, Series<TData>>): string {
    const series = location.context;
    if (series.getTooltipTitle) {
      return series.getTooltipTitle(location.dataPoint);
    }
    const xValue = defaultXDataAccessor<unknown>(location.dataPoint);
    const xAsDate = this.dateCoercer.coerce(xValue);

    return xAsDate ? this.dateFormatter.format(xAsDate) : String(xValue);
  }

  private showContextMenu(): void {
    this.popover = this.popoverService.drawPopover({
      componentOrTemplate: this.contextMenuTemplate,
      data: this.contextMenuTemplate,
      position: {
        type: PopoverPositionType.Relative,
        origin: this.container.nativeElement,
        locationPreferences: [PopoverRelativePositionLocation.AboveRightAligned]
      },
      backdrop: PopoverBackdrop.Transparent
    });
    this.popover.closeOnBackdropClick();
    this.popover.closeOnPopoverContentClick();
  }

  public contextMenuSelectHandler(_menu: ContextMenu): void {
    this.selectionChange.emit(this.selectedData);
  }
}
