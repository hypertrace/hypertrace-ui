import { distanceBetweenPoints } from '@hypertrace/common';
import { ScaleContinuousNumeric } from 'd3-scale';
import {
  MouseDataLookupStrategy,
  MouseLocationData,
  RelativeMouseLocation
} from '../utils/mouse-tracking/mouse-tracking';
import { BubbleChartData } from './bubble-chart';

export class BubbleDataLookupStrategy<TData extends Pick<BubbleChartData, 'r' | 'x' | 'y'>>
  implements MouseDataLookupStrategy<TData, undefined> {
  public constructor(
    private readonly data: TData[],
    private readonly xScale: NumericScale,
    private readonly yScale: NumericScale
  ) {}

  public dataForLocation(location: RelativeMouseLocation): MouseLocationData<TData, undefined>[] {
    return this.findIntersectingBubbles(location).map(bubble => ({
      dataPoint: bubble,
      context: undefined,
      location: location
    }));
  }

  private findIntersectingBubbles(location: RelativeMouseLocation): TData[] {
    const locationInDomain = {
      x: this.xScale.invert(location.x),
      y: this.yScale.invert(location.y)
    };

    return this.data.filter(datum => distanceBetweenPoints(locationInDomain, datum) <= datum.r);
  }
}

type NumericScale = ScaleContinuousNumeric<number, number>;
