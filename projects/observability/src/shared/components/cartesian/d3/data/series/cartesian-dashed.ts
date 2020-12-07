import { BaseType, select } from 'd3-selection';
import { CartesianLine } from './cartesian-line';

export class CartesianDashed<TData> extends CartesianLine<TData> {
  private static readonly CSS_DASHED_CLASS: string = 'dashed-data-series';
  private static readonly DASHED_WIDTH: number = 2;

  public drawSvg(element: BaseType): void {
    if (this.series.hide) {
      return;
    }

    const seriesGroup = select(element)
      .append('g')
      .classed(CartesianDashed.CSS_DASHED_CLASS, true)
      .attr('fill', 'none')
      .attr('stroke-width', CartesianDashed.DASHED_WIDTH)
      .attr('stroke', this.series.color)
      .attr('stroke-dasharray', '3, 3');

    this.drawSvgLine(seriesGroup);
    this.drawSvgPointsIfRequested(seriesGroup.node()!);
  }
}
