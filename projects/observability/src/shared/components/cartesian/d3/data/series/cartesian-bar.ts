import { path, Path } from 'd3-path';
import { BaseType, select, Selection } from 'd3-selection';
import { MouseDataLookupStrategy } from '../../../../utils/mouse-tracking/mouse-tracking';
import { Series } from '../../../chart';
import { CartesianSeries } from './cartesian-series';
import { QuadtreeDataLookupStrategy } from '../../interactivity/data-strategy/quadtree-data-lookup-strategy';
export class CartesianBar<TData> extends CartesianSeries<TData> {
  private static readonly CSS_CLASS: string = 'columns-data-series';
  private static readonly MAX_COLUMN_HEIGHT: number = 48;
  private static readonly MIN_COLUMN_WIDTH: number = 1;
  private static readonly COLUMN_ROUNDING_RADIUS: number = 2;

  public drawSvg(element: BaseType): void {
    if (this.series.hide === true) {
      return;
    }
    const seriesGroup = select(element).append('g').classed(CartesianBar.CSS_CLASS, true);

    this.drawSvgColumns(seriesGroup);
  }

  public drawCanvas(context: CanvasRenderingContext2D): void {
    const columnHeight = this.getColumnHeight();
    const columnYAdjustment = this.getOriginYAdjustment(columnHeight);

    this.series.data.forEach(datum => {
      context.translate(this.xScale.transformData(datum), this.yScale.transformData(datum));
      context.beginPath();

      this.addColumnPath(
        context,
        this.getBarOriginX(datum),
        this.getBarOriginY(datum, columnYAdjustment),
        this.getDatumWidth(datum),
        columnHeight,
        CartesianBar.COLUMN_ROUNDING_RADIUS,
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
    return new QuadtreeDataLookupStrategy(this.series, this.series.data, this.xScale, this.yScale);
  }

  private drawSvgColumns(seriesGroupSelection: Selection<SVGGElement, unknown, null, undefined>): void {
    const columnHeight = this.getColumnHeight();
    const columnYAdjustment = this.getOriginYAdjustment(columnHeight);

    seriesGroupSelection
      .attr('transform', `translate(0, ${this.yScale.getStartBandwidthAdjustment()})`)
      .selectAll('path.column')
      .data(this.series.data)
      .enter()
      .append('path')
      .classed('column', true)
      .attr('d', datum => this.generateColumnPathString(this.getDatumWidth(datum), columnHeight))
      .style('fill', datum => this.getColorForDatum(datum))
      .attr(
        'transform',
        datum => `translate(${this.getBarOriginX(datum)}, ${this.getBarOriginY(datum, columnYAdjustment)} )`,
      );
  }

  private getDatumWidth(datum: TData): number {
    return Math.max(this.xScale.transformData(datum) - this.xScale.getRangeStart(), CartesianBar.MIN_COLUMN_WIDTH);
  }

  private getBarOriginX(datum: TData): number {
    return this.xScale.transformDataOrigin(datum);
  }

  private getBarOriginY(datum: TData, columnYAdjustment: number): number {
    return this.yScale.transformData(datum) + columnYAdjustment;
  }

  private getColumnHeight(): number {
    return Math.min(
      this.yScale.getBandwidth() / this.yScale.getGroupedColumnSeriesLength(this.series),
      CartesianBar.MAX_COLUMN_HEIGHT,
    );
  }

  private getOriginYAdjustment(columnHeight: number): number {
    const totalGroupedSeries = this.yScale.getGroupedColumnSeriesLength(this.series);
    const groupedColumnAdjustment = (this.yScale.getBandwidth() - columnHeight * totalGroupedSeries) / 2;

    return totalGroupedSeries === 1
      ? groupedColumnAdjustment
      : groupedColumnAdjustment + this.xScale.getGroupedColumnSeriesPosition(this.series) * columnHeight;
  }

  private isShowBarTopRounding(): boolean {
    return this.xScale.isShowColumnRounding(this.series);
  }

  private generateColumnPathString(width: number, height: number): string {
    const columnPath = path();
    this.addColumnPath(columnPath, 0, 0, width, height, CartesianBar.COLUMN_ROUNDING_RADIUS);

    return columnPath.toString();
  }

  private addColumnPath(
    columnPath: Path | CanvasRenderingContext2D,
    startX: number,
    startY: number,
    width: number,
    height: number,
    roundingRadius: number,
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
