import { BaseType } from 'd3-selection';
import {
  MouseDataLookupStrategy,
  MouseLocationData,
  RelativeMouseLocation
} from '../../../utils/mouse-tracking/mouse-tracking';
import { AxisType, Series } from '../../chart';
import { ChartTooltipTrackingOptions as ChartTooltipTrackingStrategy } from '../../chart-interactivty';
import { SingleAxisDataLookupStrategy } from '../interactivity/data-strategy/single-axis-data-lookup-strategy';
import { AnyCartesianScale, CartesianScaleBuilder } from '../scale/cartesian-scale-builder';

export abstract class CartesianSeries<TData> {
  protected dataLookupStrategy?: MouseDataLookupStrategy<TData, Series<TData>>;
  protected xScale: AnyCartesianScale<TData>;
  protected yScale: AnyCartesianScale<TData>;

  public constructor(
    protected readonly series: Series<TData>,
    protected readonly scaleBuilder: CartesianScaleBuilder<TData>,
    tooltipTrackingStrategy?: ChartTooltipTrackingStrategy
  ) {
    this.xScale = this.buildXScale();
    this.yScale = this.buildYScale();
    if (tooltipTrackingStrategy) {
      this.dataLookupStrategy = this.buildDataLookupStrategy(tooltipTrackingStrategy);
    }
  }

  public abstract drawSvg(element: BaseType): void;
  public abstract drawCanvas(context: CanvasRenderingContext2D): void;
  protected abstract buildMultiAxisDataLookupStrategy(
    tooltipStrategy: ChartTooltipTrackingStrategy
  ): MouseDataLookupStrategy<TData, Series<TData>>;

  public dataForLocation(location: RelativeMouseLocation): MouseLocationData<TData, Series<TData>>[] {
    return this.dataLookupStrategy ? this.dataLookupStrategy.dataForLocation(location) : [];
  }

  protected buildXScale(): AnyCartesianScale<TData> {
    return this.scaleBuilder.build(AxisType.X);
  }

  protected buildYScale(): AnyCartesianScale<TData> {
    return this.scaleBuilder.build(AxisType.Y);
  }

  protected buildDataLookupStrategy(
    strategy: ChartTooltipTrackingStrategy
  ): MouseDataLookupStrategy<TData, Series<TData>> {
    if (strategy.followSingleAxis !== undefined) {
      return new SingleAxisDataLookupStrategy(
        this.series,
        this.series.data,
        this.xScale,
        this.yScale,
        strategy.radius,
        strategy.followSingleAxis
      );
    }

    return this.buildMultiAxisDataLookupStrategy(strategy);
  }
}
