import { BaseType, select } from 'd3-selection';
import { CartesianLine } from './cartesian-line';

export class CartesianDashedLine<TData> extends CartesianLine<TData> {
  private static readonly CSS_DASHED_LINE_CLASS: string = 'dashed-line-data-series';
  private static readonly DASHED_LINE_WIDTH: number = 2;

  public drawSvg(element: BaseType): void {
    if (this.series.hide) {
      return;
    }

    const seriesGroup = select(element)
      .append('g')
      .classed(CartesianDashedLine.CSS_DASHED_LINE_CLASS, true)
      .attr('fill', 'none')
      .attr('stroke-width', CartesianDashedLine.DASHED_LINE_WIDTH)
      .attr('stroke', this.series.color)
      .attr('stroke-dasharray', '3, 3');

    this.drawSvgLine(seriesGroup);
    this.drawSvgPointsIfRequested(seriesGroup.node()!);
  }
}
