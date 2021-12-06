import { MouseDataLookupStrategy } from '../../../../utils/mouse-tracking/mouse-tracking';
import { Series } from '../../../chart';
import { ChartTooltipTrackingOptions as ChartTooltipTrackingStrategy } from '../../../chart-interactivty';
import { SingleAxisDataLookupStrategy } from '../../interactivity/data-strategy/single-axis-data-lookup-strategy';
import { CartesianScaleBuilder } from '../../scale/cartesian-scale-builder';
import { CartesianData } from '../cartesian-data';

export abstract class CartesianSeries<TData> extends CartesianData<TData, Series<TData>> {
  protected dataLookupStrategy?: MouseDataLookupStrategy<TData, Series<TData>>;

  public constructor(
    protected readonly series: Series<TData>,
    protected readonly scaleBuilder: CartesianScaleBuilder<TData>,
    tooltipTrackingStrategy?: ChartTooltipTrackingStrategy
  ) {
    super(series, scaleBuilder, tooltipTrackingStrategy);
  }

  protected buildDataLookupStrategy(
    visualization: Series<TData>,
    strategy: ChartTooltipTrackingStrategy
  ): MouseDataLookupStrategy<TData, Series<TData>> {
    if (strategy.followSingleAxis !== undefined) {
      return new SingleAxisDataLookupStrategy(
        visualization,
        visualization.data,
        this.xScale,
        this.yScale,
        strategy.radius,
        strategy.followSingleAxis
      );
    }

    return this.buildMultiAxisDataLookupStrategy(strategy);
  }
}
