import { BaseType } from 'd3-selection';
import {
  MouseDataLookupStrategy,
  MouseLocationData,
  RelativeMouseLocation
} from '../../../utils/mouse-tracking/mouse-tracking';
import { AxisType } from '../../chart';
import { ChartTooltipTrackingOptions as ChartTooltipTrackingStrategy } from '../../chart-interactivty';
import { AnyCartesianScale, CartesianScaleBuilder } from '../scale/cartesian-scale-builder';

export abstract class CartesianData<TData, TVisualization> {
  protected dataLookupStrategy?: MouseDataLookupStrategy<TData, TVisualization>;
  protected xScale: AnyCartesianScale<TData>;
  protected yScale: AnyCartesianScale<TData>;

  protected constructor(
    protected readonly visualization: TVisualization,
    protected readonly scaleBuilder: CartesianScaleBuilder<TData>,
    tooltipTrackingStrategy?: ChartTooltipTrackingStrategy
  ) {
    this.xScale = this.buildXScale();
    this.yScale = this.buildYScale();
    if (tooltipTrackingStrategy) {
      this.dataLookupStrategy = this.buildDataLookupStrategy(visualization, tooltipTrackingStrategy);
    }
  }

  public abstract drawSvg(element: BaseType): void;
  public abstract drawCanvas(context: CanvasRenderingContext2D): void;

  protected abstract buildMultiAxisDataLookupStrategy(
    tooltipStrategy: ChartTooltipTrackingStrategy
  ): MouseDataLookupStrategy<TData, TVisualization>;

  protected abstract buildDataLookupStrategy(
    visualization: TVisualization,
    strategy: ChartTooltipTrackingStrategy
  ): MouseDataLookupStrategy<TData, TVisualization>;

  public dataForLocation(location: RelativeMouseLocation): MouseLocationData<TData, TVisualization>[] {
    return this.dataLookupStrategy ? this.dataLookupStrategy.dataForLocation(location) : [];
  }

  protected buildXScale(): AnyCartesianScale<TData> {
    return this.scaleBuilder.build(AxisType.X);
  }

  protected buildYScale(): AnyCartesianScale<TData> {
    return this.scaleBuilder.build(AxisType.Y);
  }
}
