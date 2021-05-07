import { BaseType, select, Selection } from 'd3-selection';
import { curveMonotoneX, line, Line } from 'd3-shape';
import { MouseDataLookupStrategy } from '../../../../utils/mouse-tracking/mouse-tracking';
import { Series, SeriesSymbol } from '../../../chart';
import { QuadtreeDataLookupStrategy } from '../../interactivity/data-strategy/quadtree-data-lookup-strategy';
import { CartesianPoints } from './cartesian-points';
import { CartesianSeries } from './cartesian-series';

export class CartesianLine<TData> extends CartesianSeries<TData> {
  private static readonly CSS_LINE_CLASS: string = 'line-data-series';
  private static readonly LINE_WIDTH: number = 2;

  public drawSvg(element: BaseType): void {
    if (this.series.hide) {
      return;
    }

    const seriesGroup = select(element)
      .append('g')
      .classed(CartesianLine.CSS_LINE_CLASS, true)
      .attr('fill', 'none')
      .attr('stroke-width', CartesianLine.LINE_WIDTH)
      .attr('stroke', this.series.color);

    this.drawSvgLine(seriesGroup);
    this.drawSvgPointsIfRequested(seriesGroup.node()!);
  }

  public drawCanvas(context: CanvasRenderingContext2D): void {
    this.drawCanvasLine(context);
    this.drawCanvasPointsIfRequested(context);
  }

  protected buildMultiAxisDataLookupStrategy(): MouseDataLookupStrategy<TData, Series<TData>> {
    return new QuadtreeDataLookupStrategy(this.series, this.series.data, this.xScale, this.yScale, 10);
  }

  protected drawSvgLine(seriesGroupSelection: Selection<SVGGElement, unknown, null, undefined>): void {
    // const line = this.buildLine();
    // const discretePoints =  this.series.data
    //   .map(datum => ([!isNaN(this.yScale.transformData(datum)), datum]))
    //   .reduce((previous, current, index, allPoints) => {},)

    seriesGroupSelection.append('path').attr('d', this.buildLine()(this.series.data)!);
  }

  private drawCanvasLine(context: CanvasRenderingContext2D): void {
    context.beginPath();
    this.buildLine().context(context)(this.series.data);
    context.strokeStyle = this.series.color;
    context.lineWidth = CartesianLine.LINE_WIDTH;
    context.stroke();
  }

  private buildLine(): Line<TData> {
    return line<TData>()
      .x(d => this.xScale.transformData(d))
      .y(d => this.yScale.transformData(d) )
      .curve(curveMonotoneX)
      .defined(d => !isNaN(this.yScale.transformData(d)));
  }

  protected drawSvgPointsIfRequested(seriesGroup: SVGGElement): void {
    if (this.series.symbol === undefined) {
      this.series.symbol == SeriesSymbol.Circle;
    }

    new CartesianPoints(this.series, this.scaleBuilder).drawSvg(seriesGroup);
  }

  private drawCanvasPointsIfRequested(context: CanvasRenderingContext2D): void {
    if (this.series.symbol === undefined) {
      this.series.symbol == SeriesSymbol.Circle;
     //  return;
    }

    new CartesianPoints(this.series, this.scaleBuilder).drawCanvas(context);
  }
}
