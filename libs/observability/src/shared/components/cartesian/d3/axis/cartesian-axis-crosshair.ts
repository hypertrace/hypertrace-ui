import { ContainerElement, mouse, select, Selection } from 'd3-selection';
import { minBy } from 'lodash-es';
import { MouseLocationData, RelativeMouseLocation } from '../../../utils/mouse-tracking/mouse-tracking';
import { AxisCrosshair, AxisType } from '../../chart';
import { ScaleBounds } from '../scale/cartesian-scale';

export class CartesianAxisCrosshair {
  private readonly crosshairFromAxis: WeakMap<SVGGElement, SVGGElement> = new WeakMap();

  public constructor(
    private readonly axisType: AxisType,
    private readonly axisCrosshair: AxisCrosshair,
    private readonly bounds: ScaleBounds
  ) {}

  public draw(axisElement: SVGGElement, locationData: MouseLocationData<unknown, unknown>[]): void {
    this.initializeCrosshairIfMissing(axisElement);
    const shouldSnap = this.axisCrosshair.snap === true;
    const snappableData = this.getSnappableData(axisElement, locationData);
    if (shouldSnap && snappableData.length === 0) {
      this.hide(axisElement);

      return;
    }

    const position = shouldSnap ? this.getDataRangeValue(snappableData[0]) : this.getMouseRangeValue(axisElement);
    const crosshairSelection = this.getCrosshairSelection(axisElement);
    this.updatePosition(
      crosshairSelection,
      position,
      locationData.map(data => data.location)
    );
    crosshairSelection.classed('hidden', false);
  }

  public hide(axisElement: SVGGElement): void {
    this.getCrosshairSelection(axisElement).classed('hidden', true);
  }

  private initializeCrosshairIfMissing(axisElement: SVGGElement): void {
    const crosshairSelection = this.getCrosshairSelection(axisElement);
    if (!crosshairSelection.empty()) {
      return;
    }
    const crosshairGroup = this.getCrosshairParentSelection(axisElement).append('g').classed('crosshair', true);
    crosshairGroup.append('line');
    // Track crosshair group as we can have multiple crosshair siblings
    this.crosshairFromAxis.set(axisElement, crosshairGroup.node()!);
  }

  private getCrosshairSelection(axisElement: SVGGElement): Selection<SVGGElement, {}, null, undefined> {
    return select(this.crosshairFromAxis.get(axisElement)!);
  }

  private getCrosshairParentSelection(axisElement: SVGElement): Selection<SVGSVGElement, {}, null, undefined> {
    return select(axisElement.parentElement as unknown as SVGSVGElement);
  }

  private updatePosition(
    crosshairSelection: Selection<SVGGElement, {}, null, undefined>,
    position: number,
    pointLocations: RelativeMouseLocation[]
  ): void {
    this.updateLinePosition(crosshairSelection, position);
    this.updatePointPosition(crosshairSelection, pointLocations);
  }

  private updateLinePosition(crosshairSelection: Selection<SVGGElement, {}, null, undefined>, position: number): void {
    const crosshairLine = crosshairSelection.select('line');

    switch (this.axisType) {
      case AxisType.X:
        crosshairLine
          .attr('x1', position)
          .attr('y1', this.bounds.startY)
          .attr('x2', position)
          .attr('y2', this.bounds.endY);
        break;
      case AxisType.Y:
        crosshairLine
          .attr('x1', this.bounds.startX)
          .attr('y1', position)
          .attr('x2', this.bounds.endX)
          .attr('y2', position);
        break;
      default:
      // NOOP
    }
  }

  private updatePointPosition(
    crosshairSelection: Selection<SVGGElement, {}, null, undefined>,
    pointLocations: RelativeMouseLocation[]
  ): void {
    const points = crosshairSelection
      .selectAll<SVGCircleElement, RelativeMouseLocation>('.crosshair-point')
      .data(pointLocations);
    points.exit().remove();

    points
      .enter()
      .append('circle')
      .classed('crosshair-point', true)
      .attr('r', 4)
      .merge(points)
      .attr('cx', data => data.x)
      .attr('cy', data => data.y);
  }

  private getMouseRangeValue(container: ContainerElement): number {
    const mouseLocation = mouse(container);
    switch (this.axisType) {
      case AxisType.Y:
        return mouseLocation[1];
      case AxisType.X:
      default:
        return mouseLocation[0];
    }
  }

  private getDataRangeValue(data: MouseLocationData<unknown, unknown>): number {
    switch (this.axisType) {
      case AxisType.Y:
        return data.location.y;
      case AxisType.X:
      default:
        return data.location.x;
    }
  }

  private getSnappableData(
    container: ContainerElement,
    data: MouseLocationData<unknown, unknown>[]
  ): MouseLocationData<unknown, unknown>[] {
    // Make sure we're only snapping to the closest point, and any other points that fall on the same line
    const mouseRange = this.getMouseRangeValue(container);
    const closestLocation = minBy(data, datum => Math.abs(this.getDataRangeValue(datum) - mouseRange));
    if (!closestLocation) {
      return [];
    }
    const closestLocationRange = this.getDataRangeValue(closestLocation);

    return data.filter(datum => this.getDataRangeValue(datum) === closestLocationRange);
  }
}
