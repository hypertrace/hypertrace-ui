import { getAngleForCoordinate } from '@hypertrace/common';
import { Bisector, bisector } from 'd3-array';
import { clone } from 'lodash-es';
import { MouseLocationData, RelativeMouseLocation } from '../../utils/mouse-tracking/mouse-tracking';
import { RadarAxisData } from '../axis/radar-chart-axis.service';
import { RadarPoint, RadarSeries } from '../radar';

export class RadialDataLookupStrategy {
  private readonly radialBisector: Bisector<RadarAxisData, number>;
  private readonly radialAxisData: RadarAxisData[];
  private readonly axisDataPointMap: WeakMap<
    RadarAxisData,
    MouseLocationData<RadarPoint, RadarSeries>[]
  > = new WeakMap();

  public constructor(private readonly allSeries: RadarSeries[], radialAxisData: RadarAxisData[]) {
    this.radialBisector = bisector(axisData => axisData.axisRadian);
    this.radialAxisData = clone(radialAxisData);
    this.radialAxisData = this.radialAxisData.sort(axisData => axisData.axisRadian);
    this.addCyclicRedundancy();
  }

  public dataForLocation(location: RelativeMouseLocation): MouseLocationData<RadarPoint, RadarSeries>[] {
    const closestAxis = this.findClosestAxis(location);

    if (closestAxis === undefined) {
      return [];
    }

    if (!this.axisDataPointMap.has(closestAxis)) {
      const locationData = this.buildLocationData(closestAxis.axisName, location);
      this.axisDataPointMap.set(closestAxis, locationData);
    }

    return this.axisDataPointMap.get(closestAxis)!;
  }

  private findClosestAxis(location: RelativeMouseLocation): RadarAxisData | undefined {
    const targetRadian: number = getAngleForCoordinate(location.x, location.y);
    const insertionIndex = this.radialBisector.left(this.radialAxisData, targetRadian);

    const leftValue = this.radialAxisData[insertionIndex - 1] as RadarAxisData | undefined;
    const rightValue = this.radialAxisData[insertionIndex] as RadarAxisData | undefined;


    if (leftValue === undefined) {
      // No values to the left. Target is smallest value.
      return rightValue;
    }
    if (rightValue === undefined) {
      // No values to the right. Target is largestValue
      return leftValue;
    }

    return targetRadian - leftValue.axisRadian > rightValue.axisRadian - targetRadian ? rightValue : leftValue;
  }

  private addCyclicRedundancy(): void {
    const firstSorted = this.radialAxisData.sort(axisData => axisData.axisRadian)[0];
    const redundantPoint = { ...firstSorted };
    /* Add 2 * Math.PI to axis radian of the first point so that radial bisector can find
     * this point from the cyclic direction
     */

    redundantPoint.axisRadian += 2 * Math.PI;
    this.radialAxisData.push(redundantPoint);
  }

  private buildLocationData(
    axisName: string,
    location: RelativeMouseLocation
  ): MouseLocationData<RadarPoint, RadarSeries>[] {
    return this.allSeries.flatMap(series =>
      series.data
        .filter(dataPoint => dataPoint.axis === axisName)
        .map(dataPoint => ({
          dataPoint: dataPoint,
          context: series,
          location: location
        }))
    );
  }
}
