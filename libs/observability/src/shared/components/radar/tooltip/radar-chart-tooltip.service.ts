import { Injectable, OnDestroy } from '@angular/core';
import { mouse } from 'd3-selection';
import { ChartTooltipBuilderService } from '../../utils/chart-tooltip/chart-tooltip-builder.service';
import { ChartTooltipRef } from '../../utils/chart-tooltip/chart-tooltip-popover';
import { DefaultChartTooltipRenderData } from '../../utils/chart-tooltip/default/default-chart-tooltip.component';
import { MouseLocationData } from '../../utils/mouse-tracking/mouse-tracking';
import { RadarChartAxisService } from '../axis/radar-chart-axis.service';
import { RadarLayoutStyleClass, RadarOptions, RadarPoint, RadarSeries, RadarSVGSelection } from '../radar';
import { RadialDataLookupStrategy } from './radial-data-lookup-strategy';

@Injectable()
export class RadarChartTooltipService implements OnDestroy {
  private readonly tooltipRef: ChartTooltipRef<RadarPoint, RadarSeries>;

  public constructor(
    private readonly radarChartAxisService: RadarChartAxisService,
    private readonly chartTooltipBuilderService: ChartTooltipBuilderService
  ) {
    this.tooltipRef = this.chartTooltipBuilderService.constructTooltip<RadarPoint, RadarSeries>(data =>
      this.convertToDefaultTooltipRenderData(data)
    );
  }

  public ngOnDestroy(): void {
    this.tooltipRef.destroy();
  }

  public addTooltipTracking(chartSelection: RadarSVGSelection, options: RadarOptions): void {
    if (options.tooltipOption.visible) {
      const lookupStrategy = new RadialDataLookupStrategy(
        options.series,
        Array.from(this.radarChartAxisService.getAxisDataMap(chartSelection).values())
      );

      const plotSelection = chartSelection.select(`.${RadarLayoutStyleClass.Plot}`);
      const plotElement = plotSelection.node()! as SVGGElement;

      plotSelection
        .on('mousemove', () => this.onMouseMove(plotElement, lookupStrategy))
        .on('mouseleave', () => this.onMouseOut());
    }
  }

  private onMouseMove(plotElement: SVGGElement, lookupStrategy: RadialDataLookupStrategy): void {
    const [x, y] = mouse(plotElement);

    // The g element's y axis is inverted to the series y axis. Flip the y axis here
    this.tooltipRef.showWithData(plotElement, lookupStrategy.dataForLocation({ x: x, y: -y }));
  }

  private onMouseOut(): void {
    this.tooltipRef.hide();
  }

  private convertToDefaultTooltipRenderData(
    data: MouseLocationData<RadarPoint, RadarSeries>[]
  ): DefaultChartTooltipRenderData {
    return {
      title: '',
      labeledValues: data.map(datum => ({
        label: datum.dataPoint.axis,
        value: datum.dataPoint.value,
        color: datum.context.color
      }))
    };
  }
}
