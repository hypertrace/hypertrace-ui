import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { SubscriptionLifecycle, TypedSimpleChanges } from '@hypertrace/common';
import { BubbleChart, BubbleChartData, BubbleChartTooltipOption } from './bubble-chart';
import { BubbleChartBuilderService } from './bubble-chart-builder.service';

@Component({
  selector: 'ht-bubble-chart',
  providers: [SubscriptionLifecycle],
  styleUrls: ['../utils/d3/d3-visualization.scss', './bubble-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fill-container bubble-chart-container" (traceLayoutChange)="this.reflow()" #bubbleChartContainer></div>
  `
})
export class BubbleChartComponent<TData extends BubbleChartData> implements OnChanges, OnDestroy, AfterViewInit {
  @Input()
  public data?: TData[];

  @Input()
  public xMin?: number;

  @Input()
  public xMax?: number;

  @Input()
  public yMin?: number;

  @Input()
  public yMax?: number;

  @Input()
  public tooltipOption?: BubbleChartTooltipOption;

  @Input()
  public selections?: TData[];

  @Input()
  public maxAllowedSelectionsCount?: number;

  @Output()
  public readonly selectionsChange: EventEmitter<TData[]> = new EventEmitter();

  @ViewChild('bubbleChartContainer', { static: true })
  private readonly bubbleChartContainer!: ElementRef;

  private bubbleChart?: BubbleChart<TData>;

  public constructor(
    private readonly bubbleChartBuilder: BubbleChartBuilderService<TData>,
    private readonly injector: Injector,
    private readonly subscriptionLifeCycle: SubscriptionLifecycle
  ) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.selections && this.bubbleChart) {
      this.bubbleChart.updateSelections(this.selections ?? []);
    } else {
      this.draw();
    }
  }

  public ngOnDestroy(): void {
    this.bubbleChart && this.bubbleChart.destroy();
    this.subscriptionLifeCycle.unsubscribe();
  }

  public ngAfterViewInit(): void {
    this.reflow();
  }

  private draw(): void {
    this.bubbleChart = this.bubbleChartBuilder.build(this.bubbleChartContainer, this.injector, {
      data: this.data ? [...this.data] : [],
      xMin: this.xMin,
      xMax: this.xMax,
      yMin: this.yMin,
      yMax: this.yMax,
      tooltipOption: this.tooltipOption,
      selections: this.selections ?? [],
      maxAllowedSelectionsCount: this.maxAllowedSelectionsCount
    });

    this.setSelectionsChangeSubscription(this.bubbleChart);
  }

  public reflow(): void {
    this.bubbleChart && this.bubbleChart.reflow();
  }

  private setSelectionsChangeSubscription(bubbleChart: BubbleChart<TData>): void {
    this.subscriptionLifeCycle.unsubscribe();
    this.subscriptionLifeCycle.add(
      bubbleChart.selections$.subscribe(selections => {
        this.selectionsChange.emit([...selections]);
      })
    );
  }
}
