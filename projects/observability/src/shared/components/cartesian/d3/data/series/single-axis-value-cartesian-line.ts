import { BaseType, select, Selection } from 'd3-selection';
import { MouseDataLookupStrategy } from '../../../../utils/mouse-tracking/mouse-tracking';
import { Series } from '../../../chart';
import { QuadtreeDataLookupStrategy } from '../../interactivity/data-strategy/quadtree-data-lookup-strategy';
import { CartesianPoints } from './cartesian-points';
import { CartesianSeries } from './cartesian-series';

export class SingleAxisValueCartesianLine<TData> extends CartesianSeries<TData> {
  private static readonly CSS_LINE_CLASS: string = 'line-data-series';
  private static readonly LINE_WIDTH: number = 5;
  private static readonly STROKE_DASH_ARRAY: string = '4, 2';

  public drawSvg(element: BaseType): void {
    if (this.series.hide) {
      return;
    }

    const seriesGroup = select(element)
      .append('g')
      .classed(SingleAxisValueCartesianLine.CSS_LINE_CLASS, true)
      .attr('fill', 'none')
      .attr('stroke-width', SingleAxisValueCartesianLine.LINE_WIDTH)
      .attr('stroke', this.series.color)
      .attr('stroke-dasharray', SingleAxisValueCartesianLine.STROKE_DASH_ARRAY);

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
    this.series.data.map(timeStampSeries => {
      seriesGroupSelection
        .append('line')
        .attr('x1', this.xScale.transformData(timeStampSeries))
        .attr('y1', this.yScale.initData.bounds.startY)
        .attr('x2', this.xScale.transformData(timeStampSeries))
        .attr('y2', this.yScale.initData.bounds.endY);
    });
  }

  private drawCanvasLine(context: CanvasRenderingContext2D): void {
    context.beginPath();
    context.strokeStyle = this.series.color;
    context.lineWidth = SingleAxisValueCartesianLine.LINE_WIDTH;
    context.stroke();
  }

  protected drawSvgPointsIfRequested(seriesGroup: SVGGElement): void {
    if (this.series.symbol === undefined) {
      return;
    }

    new CartesianPoints(this.series, this.scaleBuilder).drawSvg(seriesGroup);
  }

  private drawCanvasPointsIfRequested(context: CanvasRenderingContext2D): void {
    if (this.series.symbol === undefined) {
      return;
    }

    new CartesianPoints(this.series, this.scaleBuilder).drawCanvas(context);
  }
}
