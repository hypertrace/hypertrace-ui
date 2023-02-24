import { Injectable } from '@angular/core';
import { DomElementMeasurerService } from '@hypertrace/common';
import { sum } from 'd3-array';
import { Selection } from 'd3-selection';
import { RadarLayoutStyleClass, RadarOptions, RadarSVGSelection } from '../radar';
import { RadarObject } from '../radar-object';

@Injectable()
export class RadarChartLegendService {
  private static readonly CIRCLE_RADIUS: number = 4;
  private static readonly LEGEND_ITEM_PADDING: number = 10;
  private static readonly LEGENDS_Y_BASELINE: number = 12;
  private static readonly LEGEND_ITEM_CIRCLE_BASELINE: number = 4;
  private static readonly LEGEND_ITEM_TEXT_START_X: number = 16;

  public constructor(private readonly domElementMeasurerService: DomElementMeasurerService) {}

  public drawLegend(chartSelection: RadarSVGSelection, options: RadarOptions): void {
    const legendsSelection = chartSelection
      .select<SVGGElement>(`.${RadarLayoutStyleClass.Legend}`)
      .append('g')
      .classed('legends', true);

    this.drawLegendItems(legendsSelection, options);
    this.transformLegends(legendsSelection);
  }

  private drawLegendItems(legendsSelection: RadarLegendSVGGSelection, options: RadarOptions): void {
    const legendItemsSelection = legendsSelection
      .selectAll('.legend-item')
      .data(options.series)
      .enter()
      .append('g')
      .classed('legend-item', true);

    legendItemsSelection
      .append('circle')
      .classed('legend-symbol', true)
      .attr('cx', RadarChartLegendService.LEGEND_ITEM_CIRCLE_BASELINE)
      .attr('cy', RadarChartLegendService.LEGEND_ITEM_CIRCLE_BASELINE)
      .attr('r', RadarChartLegendService.CIRCLE_RADIUS)
      .attr('fill', series => series.color);

    legendItemsSelection
      .append('text')
      .text(series => series.name)
      .classed('legend-title', true)
      .attr('dominant-baseline', 'central')
      .attr(
        'transform',
        `translate(${RadarChartLegendService.LEGEND_ITEM_TEXT_START_X}, ${RadarChartLegendService.LEGEND_ITEM_CIRCLE_BASELINE})`
      );
  }

  private transformLegends(legendsSelection: RadarLegendSVGGSelection): void {
    const legendItemWidths: number[] = [];

    legendsSelection
      .selectAll<SVGGElement, RadarObject>('.legend-item')
      .selectAll<SVGTextElement, RadarObject>('text')
      .each((_series, index, groups) =>
        legendItemWidths.push(
          RadarChartLegendService.LEGEND_ITEM_TEXT_START_X +
            RadarChartLegendService.LEGEND_ITEM_PADDING +
            this.domElementMeasurerService.getComputedTextLength(groups[index])
        )
      );

    // Transform each legend item
    // TODO: Wrap these elements
    legendsSelection
      .selectAll<SVGGElement, RadarObject>('.legend-item')
      .attr('transform', (_series, index) => `translate(${sum(legendItemWidths.slice(0, index))}, 0)`);

    // Transform Legends to be center aligned
    legendsSelection.attr(
      'transform',
      `translate(${-sum(legendItemWidths) / 2}, ${RadarChartLegendService.LEGENDS_Y_BASELINE})`
    );
  }
}

export type RadarLegendSVGGSelection = Selection<SVGGElement, RadarObject, null, undefined>;
