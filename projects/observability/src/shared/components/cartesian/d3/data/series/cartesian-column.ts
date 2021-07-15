import { interpolate } from 'd3-interpolate';
import { path, Path } from 'd3-path';
import { BaseType, select, Selection } from 'd3-selection';
import { MouseDataLookupStrategy } from '../../../../utils/mouse-tracking/mouse-tracking';
import { Series } from '../../../chart';
import { SingleAxisDataLookupStrategy } from '../../interactivity/data-strategy/single-axis-data-lookup-strategy';
import { CartesianSeries } from './cartesian-series';
export class CartesianColumn<TData> extends CartesianSeries<TData> {
  private static readonly CSS_CLASS: string = 'columns-data-series';
  private static readonly MAX_COLUMN_WIDTH: number = 48;
  private static readonly MIN_COLUMN_HEIGHT: number = 1;
  private static readonly COLUMN_ROUNDING_RADIUS: number = 2;
  private static readonly ANIMATION_LENGTH_IN_MS: number = 375;

  public drawSvg(element: BaseType): void {
    const seriesGroup = select(element).append('g').classed(CartesianColumn.CSS_CLASS, true);

    this.drawSvgColumns(seriesGroup);
  }

  public drawCanvas(context: CanvasRenderingContext2D): void {
    const columnWidth = this.getColumnWidth();
    const columnXAdjustment = this.getOriginXAdjustment(columnWidth);

    this.series.data.forEach(datum => {
      context.translate(this.xScale.transformData(datum), this.yScale.transformData(datum));
      context.beginPath();

      this.addColumnPath(
        context,
        this.getBarOriginX(datum, columnXAdjustment),
        this.getBarOriginY(datum),
        columnWidth,
        this.getDatumHeight(datum),
        CartesianColumn.COLUMN_ROUNDING_RADIUS
      );

      context.closePath();
      context.strokeStyle = this.getColorForDatum(datum);
      context.fillStyle = this.getColorForDatum(datum);
      context.fill();
      context.stroke();
      context.resetTransform();
    });
  }

  private getColorForDatum(datum: TData): string {
    return this.series.getColor?.(datum) ?? this.series.color;
  }

  protected buildMultiAxisDataLookupStrategy(): MouseDataLookupStrategy<TData, Series<TData>> {
    return new SingleAxisDataLookupStrategy(this.series, this.series.data, this.xScale, this.yScale);
  }

  private drawSvgColumns(seriesGroupSelection: Selection<SVGGElement, unknown, null, undefined>): void {
    const columnWidth = this.getColumnWidth();
    const columnXAdjustment = this.getOriginXAdjustment(columnWidth);
    const seriesDataLength = this.series.data.length ?? 0;
    const animationDelayPerBand = CartesianColumn.ANIMATION_LENGTH_IN_MS / (seriesDataLength ? seriesDataLength : 1);

    seriesGroupSelection
      .attr('transform', `translate(${this.xScale.getStartBandwidthAdjustment()}, 0)`)
      .selectAll('path.column')
      .data(this.series.data)
      .enter()
      .append('path')
      .classed('column', true)
      .style('fill', datum => this.getColorForDatum(datum))
      .attr(
        'transform',
        datum => `translate(${this.getBarOriginX(datum, columnXAdjustment)}, ${this.getBarOriginY(datum)})`
      )
      .transition()
      .duration(CartesianColumn.ANIMATION_LENGTH_IN_MS)
      .attrTween('d', datum => this.pathTween(columnWidth, datum))
      .delay((_, i) => {
        return animationDelayPerBand * i;
      });
  }

  private pathTween = (columnWidth: number, datum: TData): ((t: number) => string) => {
    const datumHeight = this.getDatumHeight(datum);
    const interpolation = interpolate(0, datumHeight);
    return (t: number) => {
      return this.generateColumnPathString(columnWidth, datumHeight, datumHeight - interpolation(t));
    };
  };

  private getDatumHeight(datum: TData): number {
    return Math.max(this.yScale.getRangeStart() - this.yScale.transformData(datum), CartesianColumn.MIN_COLUMN_HEIGHT);
  }

  private getBarOriginY(datum: TData): number {
    return this.yScale.transformDataOrigin(datum) - this.getDatumHeight(datum);
  }

  private getBarOriginX(datum: TData, columnXAdjustment: number): number {
    return this.xScale.transformData(datum) + columnXAdjustment;
  }

  private getColumnWidth(): number {
    return Math.min(
      this.xScale.getBandwidth() / this.xScale.getGroupedColumnSeriesLength(this.series),
      CartesianColumn.MAX_COLUMN_WIDTH
    );
  }

  private getOriginXAdjustment(columnWidth: number): number {
    const totalGroupedSeries = this.xScale.getGroupedColumnSeriesLength(this.series);
    const groupedColumnAdjustment = (this.xScale.getBandwidth() - columnWidth * totalGroupedSeries) / 2;

    return totalGroupedSeries === 1
      ? groupedColumnAdjustment
      : groupedColumnAdjustment + this.xScale.getGroupedColumnSeriesPosition(this.series) * columnWidth;
  }

  private isShowBarTopRounding(): boolean {
    return this.yScale.isShowColumnRounding(this.series);
  }

  private generateColumnPathString(width: number, height: number, startY?: number): string {
    const columnPath = path();
    this.addColumnPath(columnPath, 0, startY ?? 0, width, height, CartesianColumn.COLUMN_ROUNDING_RADIUS);

    return columnPath.toString();
  }

  private addColumnPath(
    columnPath: Path | CanvasRenderingContext2D,
    startX: number,
    startY: number,
    width: number,
    height: number,
    roundingRadius: number
  ): void {
    if (this.isShowBarTopRounding()) {
      columnPath.moveTo(startX + roundingRadius, startY);
      columnPath.lineTo(width - roundingRadius, startY);
      columnPath.quadraticCurveTo(width, startY, width, startY + roundingRadius);
      columnPath.lineTo(width, height);
      columnPath.lineTo(startX, height);
      columnPath.lineTo(startX, startY + roundingRadius);
      columnPath.quadraticCurveTo(startX, startY, startX + roundingRadius, startY);
    } else {
      columnPath.rect(startX, startY, width, height);
    }
  }
}
