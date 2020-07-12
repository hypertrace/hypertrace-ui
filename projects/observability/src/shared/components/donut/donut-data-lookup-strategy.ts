import { getAngleForCoordinate } from '@hypertrace/common';
import { PieArcDatum } from 'd3-shape';
import {
  MouseDataLookupStrategy,
  MouseLocationData,
  RelativeMouseLocation
} from '../utils/mouse-tracking/mouse-tracking';
import { DonutSeries } from './donut';

export class DonutDataLookupStrategy implements MouseDataLookupStrategy<Required<DonutSeries>, undefined> {
  public constructor(
    private readonly pieData: PieArcDatum<Required<DonutSeries>>[],
    private readonly invertedY: boolean = true
  ) {}

  public dataForLocation(location: RelativeMouseLocation): MouseLocationData<Required<DonutSeries>, undefined>[] {
    const closestSlice = this.findClosestSlice(location);

    if (closestSlice === undefined) {
      return [];
    }

    return [
      {
        dataPoint: closestSlice.data,
        context: undefined,
        location: location
      }
    ];
  }

  private findClosestSlice(location: RelativeMouseLocation): PieArcDatum<Required<DonutSeries>> | undefined {
    const targetRadian: number = getAngleForCoordinate(location.x, this.invertedY ? -location.y : location.y);

    return this.pieData.find(slice => targetRadian >= slice.startAngle && targetRadian <= slice.endAngle);
  }
}
