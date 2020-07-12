import { bisector, Bisector } from 'd3-array';
import {
  MouseDataLookupStrategy,
  MouseLocationData,
  RelativeMouseLocation
} from '../../../../utils/mouse-tracking/mouse-tracking';
import { AxisType } from '../../../chart';
import { AnyCartesianScale } from '../../scale/cartesian-scale-builder';

export class SingleAxisDataLookupStrategy<TData, TContext> implements MouseDataLookupStrategy<TData, TContext> {
  private readonly locationBisector: Bisector<MouseLocationData<TData, TContext>, number>;
  private readonly locationData: MouseLocationData<TData, TContext>[];

  public constructor(
    context: TContext,
    data: TData[],
    private readonly xScale: AnyCartesianScale<TData>,
    private readonly yScale: AnyCartesianScale<TData>,
    private readonly searchRadius: number = Infinity,
    private readonly axisType: AxisType = AxisType.X
  ) {
    this.locationBisector = bisector(dataPoint => this.getRangeValueFromLocation(dataPoint.location));

    this.locationData = data.map(dataPoint => ({
      dataPoint: dataPoint,
      context: context,
      location: this.dataToLocationCoordinates(dataPoint)
    }));
  }

  public dataForLocation(location: RelativeMouseLocation): MouseLocationData<TData, TContext>[] {
    const target = this.getRangeValueFromLocation(location);

    const closest = this.findClosestValue(target);
    if (closest !== undefined && this.isValueWithinRadius(target, closest)) {
      return [closest];
    }

    return [];
  }

  private dataToLocationCoordinates(data: TData): RelativeMouseLocation {
    return {
      x: this.xScale.transformToTooltipAnchor(data),
      y: this.yScale.transformToTooltipAnchor(data)
    };
  }

  private getRangeValueFromLocation(location: RelativeMouseLocation): number {
    switch (this.axisType) {
      case AxisType.Y:
        return location.y;
      case AxisType.X:
      default:
        return location.x;
    }
  }

  private isValueWithinRadius(target: number, value: MouseLocationData<TData, TContext>): boolean {
    return Math.abs(target - this.getRangeValueFromLocation(value.location)) < this.searchRadius;
  }

  private findClosestValue(target: number): MouseLocationData<TData, TContext> | undefined {
    const insertionIndex = this.locationBisector.left(this.locationData, target);

    const leftValue = this.locationData[insertionIndex - 1] as MouseLocationData<TData, TContext> | undefined;
    const rightValue = this.locationData[insertionIndex] as MouseLocationData<TData, TContext> | undefined;

    if (leftValue === undefined) {
      // No values to the left. Target is smallest value.
      return rightValue;
    }
    if (rightValue === undefined) {
      // No values to the right. Target is largestValue
      return leftValue;
    }
    const leftRangeValue = this.getRangeValueFromLocation(leftValue.location);
    const rightRangeValue = this.getRangeValueFromLocation(rightValue.location);

    return target - leftRangeValue > rightRangeValue - target ? rightValue : leftValue;
  }
}
