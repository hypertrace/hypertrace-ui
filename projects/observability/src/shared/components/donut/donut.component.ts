import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { LegendPosition } from '../legend/legend.component';
import { TooltipOption } from '../utils/d3/d3-visualization-builder.service';
import { Donut, DonutCenter, DonutSeries } from './donut';
import { DonutBuilderService } from './donut-builder.service';

@Component({
  selector: 'ht-donut',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../utils/d3/d3-visualization.scss', './donut.component.scss'],
  template: ` <div class="fill-container donut-container" (htLayoutChange)="this.reflow()" #donutContainer></div> `
})
export class DonutComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input()
  public series?: DonutSeries[];

  @Input()
  public center?: DonutCenter;

  @Input()
  public legendPosition?: LegendPosition;

  @Input()
  public tooltipOption?: TooltipOption;

  @Input()
  public displayLegendCounts: boolean = true;

  @ViewChild('donutContainer', { static: true })
  private readonly donutContainer!: ElementRef;

  private donut?: Donut;

  public constructor(private readonly donutBuilder: DonutBuilderService, private readonly injector: Injector) {}

  public ngOnChanges(): void {
    this.draw();
  }

  public ngOnDestroy(): void {
    this.donut && this.donut.destroy();
  }

  public ngAfterViewInit(): void {
    this.reflow();
  }

  private draw(): void {
    this.donut = this.donutBuilder.build(this.donutContainer, this.injector, {
      series: this.series ? [...this.series] : [],
      center: this.center,
      legendPosition: this.legendPosition,
      tooltipOption: this.tooltipOption,
      displayLegendCounts: this.displayLegendCounts
    });
  }

  public reflow(): void {
    this.donut && this.donut.reflow();
  }
}
