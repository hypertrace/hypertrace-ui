import { BaseType, select, Selection } from 'd3-selection';
import {
  Symbol,
  symbol as symbolBuilder,
  symbolCircle,
  symbolCross,
  symbolSquare,
  symbolTriangle,
  SymbolType
} from 'd3-shape';
import { MouseDataLookupStrategy } from '../../../utils/mouse-tracking/mouse-tracking';
import { Series, SeriesSymbol } from '../../chart';
import { QuadtreeDataLookupStrategy } from '../interactivity/data-strategy/quadtree-data-lookup-strategy';
import { CartesianSeries } from './cartesian-series';

export class CartesianPoints<TData> extends CartesianSeries<TData> {
  private static readonly CSS_CLASS: string = 'points-data-series';

  public drawSvg(element: BaseType): void {
    const seriesGroup = select(element).append('g').classed(CartesianPoints.CSS_CLASS, true);
    this.drawSvgSymbols(seriesGroup);
  }

  public drawCanvas(context: CanvasRenderingContext2D): void {
    const symbol = this.getSymbolGenerator(this.series.symbol).size(48).context(context);

    this.series.data.forEach(data => {
      context.translate(this.xScale.transformData(data), this.yScale.transformData(data));
      context.beginPath();
      symbol();
      context.closePath();
      context.strokeStyle = this.series.color;
      context.fillStyle = this.series.color;
      context.fill();
      context.stroke();
      context.resetTransform();
    });
  }

  protected buildMultiAxisDataLookupStrategy(): MouseDataLookupStrategy<TData, Series<TData>> {
    return new QuadtreeDataLookupStrategy(this.series, this.series.data, this.xScale, this.yScale);
  }

  private drawSvgSymbols(seriesGroupSelection: Selection<SVGGElement, unknown, null, undefined>): void {
    const symbol = this.getSymbolGenerator().size(48);
    seriesGroupSelection
      .selectAll('.point')
      .data(this.series.data)
      .enter()
      .append('path')
      .classed('point', true)
      .attr('fill', this.series.color)
      .attr('d', symbol)
      // Note these transforms assume the point is on the line. Will break for less-strict curves
      .attr('transform', data => `translate(${this.xScale.transformData(data)}, ${this.yScale.transformData(data)})`);
  }

  private getSymbolGenerator(symbol?: SeriesSymbol): Symbol<void, TData> {
    return symbolBuilder().type(this.lookupSymbolType(symbol));
  }

  private lookupSymbolType(symbol?: SeriesSymbol): SymbolType {
    switch (symbol) {
      case SeriesSymbol.Square:
        return symbolSquare;
      case SeriesSymbol.Triangle:
        return symbolTriangle;
      case SeriesSymbol.Cross:
        return symbolCross;
      case SeriesSymbol.Circle:
      default:
        return symbolCircle;
    }
  }
}
