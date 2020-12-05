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
  private static readonly CSS_BAND_CLASS: string = 'band-group';
  private static readonly CSS_SERIES_CLASS: string = 'band-data-series';
  private static readonly LINE_WIDTH: number = 2;

  public constructor(
    protected readonly d3Utils: D3UtilService,
    protected readonly domRenderer: Renderer2,
    protected readonly band: Band<TData>,
    protected readonly scaleBuilder: CartesianScaleBuilder<TData>,
    tooltipTrackingStrategy?: ChartTooltipTrackingStrategy
  ) {
    super(band, scaleBuilder, tooltipTrackingStrategy);
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

  private getCombinedData(band: Band<TData>): TData[] {
    return [band.upper.data, band.lower.data].flatMap(d => d);
  }

  private getPairedData(band: Band<TData>): [TData, TData][] {
    if (band.upper.data.length !== band.lower.data.length) {
      return [];
    }

    return band.upper.data.map((upperData: TData, index: number) => [upperData, band.lower.data[index]]);
  }

  /*
   * SVG
   */

  public drawSvg(element: Element): void {
    if (this.band.hide) {
      return;
    }

    const group = this.d3Utils
      .select(element, this.domRenderer)
      .append('g')
      .classed(CartesianBand.CSS_BAND_CLASS, true);

    const upperSeriesGroup = group
      .append('g')
      .classed(CartesianBand.CSS_SERIES_CLASS, true)
      .attr('fill', 'none')
      .attr('stroke-width', CartesianBand.LINE_WIDTH)
      .attr('stroke', this.band.upper.color)
      .attr('stroke-dasharray', '3, 3');

    this.drawSvgLine(this.band.upper, upperSeriesGroup);
    this.drawSvgPointsIfRequested(this.band.upper, upperSeriesGroup.node()!);

    const lowerSeriesGroup = group
      .append('g')
      .classed(CartesianBand.CSS_SERIES_CLASS, true)
      .attr('fill', 'none')
      .attr('stroke-width', CartesianBand.LINE_WIDTH)
      .attr('stroke', this.band.lower.color)
      .attr('stroke-dasharray', '3, 3');

    this.drawSvgLine(this.band.lower, lowerSeriesGroup);
    this.drawSvgPointsIfRequested(this.band.lower, lowerSeriesGroup.node()!);

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
      .attr('d', this.buildArea()(this.getPairedData(this.band))!)
      .style('fill', this.band.color)
      .style('opacity', this.band.opacity);
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
    this.drawCanvasLine(this.band.upper, context);
    this.drawCanvasLine(this.band.lower, context);
    this.drawCanvasPointsIfRequested(this.band.upper, context);
    this.drawCanvasPointsIfRequested(this.band.lower, context);
    this.drawCanvasArea(context);
  }

  protected buildMultiAxisDataLookupStrategy(): MouseDataLookupStrategy<TData, Band<TData>> {
    return new QuadtreeDataLookupStrategy(this.band, this.getCombinedData(this.band), this.xScale, this.yScale, 10);
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
    this.buildArea().context(context)(this.getPairedData(this.band));
    context.strokeStyle = this.band.color;
    context.fillStyle = this.band.color;
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
