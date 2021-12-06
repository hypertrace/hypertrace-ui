import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild
} from '@angular/core';
import { RecursivePartial } from '@hypertrace/common';
import { LegendPosition } from '../legend/legend.component';
import { RadarAxis, RadarOptions, RadarPoint, RadarPointEvent, RadarSeries, RadarTooltipOption } from './radar';
import { RadarChartService } from './radar-chart.service';

@Component({
  selector: 'ht-radar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div class="ht-radar-chart" (htLayoutChange)="this.buildChart()" #chartContainer></div> `,
  styleUrls: ['./radar-chart.scss']
})
export class RadarChartComponent implements OnChanges {
  @Input()
  public title: string = '';

  @Input()
  public axes: RadarAxis[] = [];

  @Input()
  public series: RadarSeries[] = [];

  @Input()
  public levels?: number;

  @Input()
  public legendHeight?: number;

  @Input()
  public legendPosition?: LegendPosition = LegendPosition.Bottom;

  @Input()
  public tooltipOption?: RadarTooltipOption;

  @Output()
  public readonly pointClicked: EventEmitter<RadarPointEvent> = new EventEmitter<RadarPointEvent>();

  @Output()
  public readonly seriesClicked: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('chartContainer', { static: true })
  private readonly chartContainer!: ElementRef;

  public constructor(private readonly radarChartService: RadarChartService) {}

  public ngOnChanges(): void {
    this.buildChart();
  }

  public buildChart(): void {
    this.radarChartService.buildChart(this.chartContainer.nativeElement, this.buildRadarOptions());
  }

  private buildRadarOptions(): RecursivePartial<RadarOptions> {
    return {
      title: this.title,
      axes: this.axes,
      series: this.series,
      legendHeight: this.legendHeight,
      legendPosition: this.legendPosition,
      levels: this.levels,
      tooltipOption: this.tooltipOption,
      onPointClicked: (point: RadarPoint, seriesName: string) =>
        this.pointClicked.emit({
          point: point,
          seriesName: seriesName
        }),
      onSeriesClicked: (seriesName: string) => {
        this.seriesClicked.emit(seriesName);
      }
    };
  }
}
