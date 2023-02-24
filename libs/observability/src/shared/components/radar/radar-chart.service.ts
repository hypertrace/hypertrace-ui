import { Injectable } from '@angular/core';
import { RecursivePartial } from '@hypertrace/common';
import { select } from 'd3-selection';
import { defaultsDeep } from 'lodash-es';
import { LegendPosition } from '../legend/legend.component';
import { RadarChartAxisService } from './axis/radar-chart-axis.service';
import { RadarChartLayoutService } from './layout/radar-chart-layout.service';
import { RadarChartLegendService } from './legend/radar-chart-legend.service';
import { RadarContainerSelection, RadarOptions, RadarSeries, RadarSVGSelection } from './radar';
import { RadarObject } from './radar-object';
import { RadarSeriesRendererService } from './series/radar-series-renderer.service';
import { RadarChartTooltipService } from './tooltip/radar-chart-tooltip.service';

@Injectable()
export class RadarChartService {
  public constructor(
    private readonly radarChartLayoutService: RadarChartLayoutService,
    private readonly radarChartAxisService: RadarChartAxisService,
    private readonly radarSeriesRendererService: RadarSeriesRendererService,
    private readonly radarChartLegendService: RadarChartLegendService,
    private readonly radarChartTooltipService: RadarChartTooltipService
  ) {}

  public buildChart(chartContainer: HTMLElement, options: RecursivePartial<RadarOptions>): RadarObject {
    const containerSelection = select<HTMLElement, RadarObject>(chartContainer);
    const resolvedOptions = this.getResolvedOptions(options);

    // Clear existing chart, if any.
    this.clearSvg(containerSelection);

    // Draw
    this.drawChart(containerSelection, resolvedOptions);

    const chartObject = new RadarObject(containerSelection, resolvedOptions, this);
    containerSelection.datum(chartObject);

    return chartObject;
  }

  public redraw(containerSelection: RadarContainerSelection, options: RadarOptions): void {
    this.clearSvg(containerSelection); // Todo: this should not be required
    this.drawChart(containerSelection, options);
  }

  public getChartFromElement(chartContainer: HTMLElement): RadarObject | undefined {
    const containerSelection = select<HTMLElement, RadarObject | undefined>(chartContainer);

    return containerSelection.datum();
  }

  private drawChart(containerSelection: RadarContainerSelection, options: RadarOptions): void {
    const chartSelection = this.buildChartSelection(containerSelection, options);
    this.drawLayout(chartSelection, options);
    this.drawAxes(chartSelection, options);
    this.drawSeries(chartSelection, options);
    this.drawLegend(chartSelection, options);
    this.maybeEnableTooltip(chartSelection, options);
  }

  private buildChartSelection(containerSelection: RadarContainerSelection, options: RadarOptions): RadarSVGSelection {
    const width = (containerSelection.node() as HTMLElement).offsetWidth;
    const height = (containerSelection.node() as HTMLElement).offsetHeight;
    const chartWidth = width - options.chartMargin.left - options.chartMargin.right;
    const chartHeight = height - options.chartMargin.top - options.chartMargin.bottom;

    return containerSelection
      .append<SVGElement>('svg')
      .attr('width', width)
      .attr('height', height)
      .append<SVGElement>('svg:g')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr(
        'transform',
        `translate(${options.chartMargin.left + chartWidth / 2}, ${options.chartMargin.top + chartHeight / 2})`
      );
  }

  private clearSvg(containerSelection: RadarContainerSelection): void {
    containerSelection.selectAll('svg').remove();
  }

  private drawLayout(chartSelection: RadarSVGSelection, options: RadarOptions): void {
    this.radarChartLayoutService.drawLayout(chartSelection, options);
  }

  private drawAxes(chartSelection: RadarSVGSelection, options: RadarOptions): void {
    this.radarChartAxisService.drawAxes(chartSelection, options);
  }

  private drawSeries(chartSelection: RadarSVGSelection, options: RadarOptions): void {
    this.radarSeriesRendererService.drawSeries(chartSelection, options);
  }

  private drawLegend(chartSelection: RadarSVGSelection, options: RadarOptions): void {
    if (options.legendPosition !== LegendPosition.None) {
      this.radarChartLegendService.drawLegend(chartSelection, options);
    }
  }

  private maybeEnableTooltip(chartSelection: RadarSVGSelection, options: RadarOptions): void {
    if (options.tooltipOption.visible) {
      this.radarChartTooltipService.addTooltipTracking(chartSelection, options);
    }
  }

  private getResolvedOptions(options: RecursivePartial<RadarOptions>): RadarOptions {
    options.series = options.series?.map(series => defaultsDeep({}, series, this.getDefaultSeries()) as RadarSeries);

    return defaultsDeep({}, options, this.getDefaultOptions()) as RadarOptions;
  }

  private getDefaultSeries(): RecursivePartial<RadarSeries> {
    return {
      showPoints: true
    };
  }

  private getDefaultOptions(): RadarOptions {
    return {
      title: '',
      axes: [],
      series: [],
      legendHeight: 25,
      legendPosition: LegendPosition.Bottom,
      levels: 10,
      tooltipOption: {
        visible: true
      },
      chartMargin: {
        top: 40,
        left: 0,
        bottom: 16,
        right: 0
      },
      plotMargin: {
        top: 24,
        left: 0,
        bottom: 44,
        right: 0
      },
      onPointClicked: () => {
        /** NOOP */
      },
      onSeriesClicked: () => {
        /** NOOP */
      }
    };
  }
}
