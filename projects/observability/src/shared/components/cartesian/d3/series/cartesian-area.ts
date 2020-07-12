import { BaseType, select, Selection } from 'd3-selection';
import { area, curveMonotoneX, Line } from 'd3-shape';
import { MouseDataLookupStrategy } from '../../../utils/mouse-tracking/mouse-tracking';
import { Series } from '../../chart';
import { QuadtreeDataLookupStrategy } from '../interactivity/data-strategy/quadtree-data-lookup-strategy';
import { CartesianLine } from './cartesian-line';
import { CartesianSeries } from './cartesian-series';

export class CartesianArea<TData> extends CartesianSeries<TData> {
  private static readonly CSS_CLASS: string = 'area-data-series';

  public drawSvg(element: BaseType): void {
    const seriesGroup = select(element).append('g').classed(CartesianArea.CSS_CLASS, true);

    this.drawSvgArea(seriesGroup);
    this.buildLine().drawSvg(seriesGroup.node()!);
  }

  public drawCanvas(context: CanvasRenderingContext2D): void {
    this.drawCanvasArea(context);

    this.buildLine().drawCanvas(context);
  }

  protected buildMultiAxisDataLookupStrategy(): MouseDataLookupStrategy<TData, Series<TData>> {
    return new QuadtreeDataLookupStrategy(this.series, this.series.data, this.xScale, this.yScale);
  }

  private drawSvgArea(seriesGroupSelection: Selection<SVGGElement, unknown, null, undefined>): void {
    seriesGroupSelection
      .append('path')
      .attr('fill', this.series.color)
      .attr('fill-opacity', 0.4)
      .attr('d', this.buildArea()(this.series.data)!);
  }

  private drawCanvasArea(context: CanvasRenderingContext2D): void {
    context.save();
    context.beginPath();
    this.buildArea().context(context)(this.series.data);
    context.strokeStyle = this.series.color;
    context.fillStyle = this.series.color;
    context.globalAlpha = 0.4;
    context.fill();
    context.restore();
  }

  private buildArea(): Line<TData> {
    return area<TData>()
      .x(d => this.xScale.transformData(d))
      .y1(d => this.yScale.transformData(d))
      .y0(() => this.yScale.getRangeStart())
      .curve(curveMonotoneX);
  }

  private buildLine(): CartesianLine<TData> {
    return new CartesianLine({ ...this.series, symbol: undefined }, this.scaleBuilder);
  }
}
