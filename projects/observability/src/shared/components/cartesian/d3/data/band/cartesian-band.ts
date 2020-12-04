import { Renderer2 } from '@angular/core';
import { Selection } from 'd3-selection';
import { Area, area, curveMonotoneX, line, Line } from 'd3-shape';
import { D3UtilService } from '../../../../utils/d3/d3-util.service';
import { MouseDataLookupStrategy } from '../../../../utils/mouse-tracking/mouse-tracking';
import { Band, Series } from '../../../chart';
import { ChartTooltipTrackingOptions as ChartTooltipTrackingStrategy } from '../../../chart-interactivty';
import { QuadtreeDataLookupStrategy } from '../../interactivity/data-strategy/quadtree-data-lookup-strategy';
import { SingleAxisDataLookupStrategy } from '../../interactivity/data-strategy/single-axis-data-lookup-strategy';
import { CartesianScaleBuilder } from '../../scale/cartesian-scale-builder';
import { CartesianData } from '../cartesian-data';
import { CartesianPoints } from '../series/cartesian-points';

export class CartesianBand<TData> extends CartesianData<TData, Band<TData>> {
  private static readonly CSS_RANGE_CLASS: string = 'range-group';
  private static readonly CSS_SERIES_CLASS: string = 'range-data-series';
  private static readonly LINE_WIDTH: number = 2;

  public constructor(
    protected readonly d3Utils: D3UtilService,
    protected readonly domRenderer: Renderer2,
    protected readonly range: Band<TData>,
    protected readonly scaleBuilder: CartesianScaleBuilder<TData>,
    tooltipTrackingStrategy?: ChartTooltipTrackingStrategy
  ) {
    super(range, scaleBuilder, tooltipTrackingStrategy);
  }

  protected buildDataLookupStrategy(
    visualization: Band<TData>,
    strategy: ChartTooltipTrackingStrategy
  ): MouseDataLookupStrategy<TData, Band<TData>> {
    if (strategy.followSingleAxis !== undefined) {
      return new SingleAxisDataLookupStrategy(
        visualization,
        this.getCombinedData(visualization),
        this.xScale,
        this.yScale,
        strategy.radius,
        strategy.followSingleAxis
      );
    }

    return this.buildMultiAxisDataLookupStrategy();
  }

  private getCombinedData(range: Band<TData>): TData[] {
    return [range.upper.data, range.lower.data].flatMap(d => d);
  }

  private getPairedData(range: Band<TData>): [TData, TData][] {
    if (range.upper.data.length !== range.lower.data.length) {
      return [];
    }

    return range.upper.data.map((upperData: TData, index: number) => [upperData, range.lower.data[index]]);
  }

  /*
   * SVG
   */

  public drawSvg(element: Element): void {
    if (this.range.hide) {
      return;
    }

    const group = this.d3Utils
      .select(element, this.domRenderer)
      .append('g')
      .classed(CartesianBand.CSS_RANGE_CLASS, true);

    const upperSeriesGroup = group
      .append('g')
      .classed(CartesianBand.CSS_SERIES_CLASS, true)
      .attr('fill', 'none')
      .attr('stroke-width', CartesianBand.LINE_WIDTH)
      .attr('stroke', this.range.upper.color)
      .attr('stroke-dasharray', '3, 3');

    this.drawSvgLine(this.range.upper, upperSeriesGroup);
    this.drawSvgPointsIfRequested(this.range.upper, upperSeriesGroup.node()!);

    const lowerSeriesGroup = group
      .append('g')
      .classed(CartesianBand.CSS_SERIES_CLASS, true)
      .attr('fill', 'none')
      .attr('stroke-width', CartesianBand.LINE_WIDTH)
      .attr('stroke', this.range.lower.color)
      .attr('stroke-dasharray', '3, 3');

    this.drawSvgLine(this.range.lower, lowerSeriesGroup);
    this.drawSvgPointsIfRequested(this.range.lower, lowerSeriesGroup.node()!);

    this.drawSvgArea(group);
  }

  private drawSvgLine(
    series: Series<TData>,
    seriesGroupSelection: Selection<SVGGElement, unknown, null, undefined>
  ): void {
    seriesGroupSelection.append('path').attr('d', this.buildLine()(series.data)!);
  }

  private drawSvgArea(groupSelection: Selection<SVGGElement, unknown, null, undefined>): void {
    groupSelection
      .append('path')
      .attr('d', this.buildArea()(this.getPairedData(this.range))!)
      .style('fill', this.range.color)
      .style('opacity', this.range.opacity);
  }

  private drawSvgPointsIfRequested(series: Series<TData>, seriesGroup: SVGGElement): void {
    if (series.symbol === undefined) {
      return;
    }

    new CartesianPoints(series, this.scaleBuilder).drawSvg(seriesGroup);
  }

  /*
   * Canvas
   */

  public drawCanvas(context: CanvasRenderingContext2D): void {
    this.drawCanvasLine(this.range.upper, context);
    this.drawCanvasLine(this.range.lower, context);
    this.drawCanvasPointsIfRequested(this.range.upper, context);
    this.drawCanvasPointsIfRequested(this.range.lower, context);
    this.drawCanvasArea(context);
  }

  protected buildMultiAxisDataLookupStrategy(): MouseDataLookupStrategy<TData, Band<TData>> {
    return new QuadtreeDataLookupStrategy(this.range, this.getCombinedData(this.range), this.xScale, this.yScale, 10);
  }

  private drawCanvasLine(series: Series<TData>, context: CanvasRenderingContext2D): void {
    context.beginPath();
    this.buildLine().context(context)(series.data);
    context.strokeStyle = series.color;
    context.lineWidth = CartesianBand.LINE_WIDTH;
    context.stroke();
  }

  private drawCanvasArea(context: CanvasRenderingContext2D): void {
    context.save();
    context.beginPath();
    this.buildArea().context(context)(this.getPairedData(this.range));
    context.strokeStyle = this.range.color;
    context.fillStyle = this.range.color;
    context.globalAlpha = 0.4;
    context.fill();
    context.restore();
  }

  private drawCanvasPointsIfRequested(series: Series<TData>, context: CanvasRenderingContext2D): void {
    if (series.symbol === undefined) {
      return;
    }

    new CartesianPoints(series, this.scaleBuilder).drawCanvas(context);
  }

  /*
   * Build
   */

  private buildLine(): Line<TData> {
    return line<TData>()
      .x(d => this.xScale.transformData(d))
      .y(d => this.yScale.transformData(d))
      .curve(curveMonotoneX);
  }

  private buildArea(): Area<[TData, TData]> {
    return area<[TData, TData]>()
      .x0(d => this.xScale.transformData(d[0]))
      .x1(d => this.xScale.transformData(d[1]))
      .y0(d => this.yScale.transformData(d[0]))
      .y1(d => this.yScale.transformData(d[1]))
      .curve(curveMonotoneX);
  }
}
