import { quadtree, Quadtree } from 'd3-quadtree';
import {
  MouseDataLookupStrategy,
  MouseLocationData,
  RelativeMouseLocation
} from '../../../../utils/mouse-tracking/mouse-tracking';
import { AnyCartesianScale } from '../../scale/cartesian-scale-builder';

export class QuadtreeDataLookupStrategy<TData, TContext> implements MouseDataLookupStrategy<TData, TContext> {
  private readonly quadTree: Quadtree<MouseLocationData<TData, TContext>>;

  public constructor(
    context: TContext,
    data: TData[],
    private readonly xScale: AnyCartesianScale<TData>,
    private readonly yScale: AnyCartesianScale<TData>,
    private readonly searchRadius?: number
  ) {
    const locationData = data.map(dataPoint => ({
      dataPoint: dataPoint,
      context: context,
      location: this.dataToLocationCoordinates(dataPoint)
    }));

    this.quadTree = quadtree<MouseLocationData<TData, TContext>>()
      .x(location => this.xScale.transformData(location.dataPoint))
      .y(location => this.yScale.transformData(location.dataPoint))
      .addAll(locationData);
  }

  public dataForLocation(location: RelativeMouseLocation): MouseLocationData<TData, TContext>[] {
    const locationDatum = this.quadTree.find(location.x, location.y, this.searchRadius);

    return locationDatum === undefined ? [] : [locationDatum];
  }

  private dataToLocationCoordinates(data: TData): RelativeMouseLocation {
    return {
      x: this.xScale.transformToTooltipAnchor(data),
      y: this.yScale.transformToTooltipAnchor(data)
    };
  }
}
