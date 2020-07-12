import { AxisScale } from 'd3-axis';
import { ScaleBand, ScaleLinear, ScaleTime } from 'd3-scale';
import { last } from 'lodash';
import { AxisType, ScaleType, Series } from '../../chart';
import { SeriesState } from './state/series-state';

export abstract class CartesianScale<TData, TDomain> {
  public abstract d3Implementation: AxisScale<TDomain>;
  private readonly dataAccessor: (data: TData) => TDomain;

  public constructor(public readonly axisType: AxisType, public readonly initData: ScaleInitializationData<TData>) {
    this.dataAccessor = initData.dataAccesor;
    this.buildScale();
  }

  public transformData(value: TData): number {
    return this.transformDomain(this.getValueFromData(value));
  }

  public abstract transformDomain(value: TDomain): number;

  public abstract getTickFormatter(): (value: TDomain) => string;

  public abstract transformDataOrigin(datum: TData): number;

  protected abstract getEmptyScale(): AxisScale<TDomain>;

  protected abstract setDomain(): void;

  protected abstract setRange(): void;

  public getValueFromData(data: TData): TDomain {
    return this.dataAccessor(data);
  }

  public transformToTooltipAnchor(value: TData): number {
    return this.transformDomain(this.getValueFromData(value));
  }

  public getRangeStart(): number {
    return this.d3Implementation.range()[0];
  }

  public getRangeEnd(): number {
    return this.d3Implementation.range()[1]; // TODO eventually need to support quantiles etc.
  }

  public abstract getBandwidth(): number;

  public getStartBandwidthAdjustment(): number {
    return 0;
  }

  public getGroupedColumnSeriesPosition(currentSeries: Series<TData>): number {
    if (currentSeries.stacking) {
      return 0;
    }

    const siblingSeries = this.initData.allSeries.filter(series => series.type === currentSeries.type);
    const hasStacking = siblingSeries.some(series => series.stacking);
    const currentSeriesIndex = siblingSeries
      .filter(series => !series.stacking)
      .findIndex(series => series === currentSeries);

    return hasStacking ? currentSeriesIndex + 1 : currentSeriesIndex;
  }

  public getGroupedColumnSeriesLength(currentSeries: Series<TData>): number {
    const siblingSeries = this.initData.allSeries.filter(series => series.type === currentSeries.type);
    const hasStacking = siblingSeries.some(series => series.stacking);

    return hasStacking ? siblingSeries.filter(series => !series.stacking).length + 1 : siblingSeries.length;
  }

  public isShowColumnRounding(currentSeries: Series<TData>): boolean {
    if (currentSeries.stacking) {
      const siblingSeries = this.initData.allSeries.filter(series => series.type === currentSeries.type);

      return currentSeries === last(siblingSeries.filter(series => series.stacking));
    }

    return true;
  }

  protected buildScale(): void {
    this.d3Implementation = this.getEmptyScale();
    this.setDomain();
    this.setRange();
  }

  protected buildRange(): [number, number] {
    // TODO discrete ranges
    switch (this.axisType) {
      case AxisType.Y:
        return [this.initData.bounds.startY, this.initData.bounds.endY];
      case AxisType.X:
      default:
        return [this.initData.bounds.startX, this.initData.bounds.endX];
    }
  }
}

export interface D3ScaleTypeMap {
  [ScaleType.Linear]: ScaleLinear<number, number>;
  [ScaleType.Time]: ScaleTime<number, number>;
  [ScaleType.Band]: ScaleBand<string>;
}

export type D3ScaleForType<T extends keyof D3ScaleTypeMap, TDomain> = D3ScaleTypeMap[T] & AxisScale<TDomain>;

export interface ScaleInitializationData<TData> {
  bounds: ScaleBounds;
  min?: number;
  max?: number;
  allSeries: Series<TData>[];
  seriesState?: SeriesState<TData>;
  dataAccesor<TDomain>(data: TData): TDomain;
}

export interface ScaleBounds {
  startY: number;
  endY: number;
  startX: number;
  endX: number;
}
