import { assertUnreachable } from '@hypertrace/common';
import { Axis, AxisType, Band, ScaleType, Series } from '../../chart';
import { CartesianBandScale } from './band/cartesian-band-scale';
import { ScaleBounds, ScaleInitializationData } from './cartesian-scale';
import { defaultXDataAccessor, defaultYDataAccessor, getDefaultScaleType } from './default-data-accessors';
import { CartesianContinuousScale } from './numeric/linear/cartesian-continuous-scale';
import { CartesianTimeScale } from './numeric/time/cartesian-time-scale';
import { CartesianStackingState } from './state/cartesian-stacking-state';
import { SeriesState } from './state/series-state';

export class CartesianScaleBuilder<TData> {
  public static newBuilder<TData>(): CartesianScaleBuilder<TData> {
    return new CartesianScaleBuilder<TData>();
  }

  private constructor(private readonly scaleState: ScaleState<TData, unknown> = {}) {}

  public withScaleType(scaleType?: ScaleType): this {
    return this.cloneWith({ scaleType: scaleType });
  }

  public withDefaultXRange(xMinMax?: MinMax): this {
    return this.cloneWith({ defaultXMinMax: xMinMax });
  }

  public withDefaultYRange(yMinMax?: MinMax): this {
    return this.cloneWith({ defaultYMinMax: yMinMax });
  }

  public withAxis(axis: Axis): this {
    switch (axis.type) {
      case AxisType.Y:
        return this.cloneWith({ yAxis: axis });
      case AxisType.X:
      default:
        return this.cloneWith({ xAxis: axis });
    }
  }

  public withXDataAccessor(dataAccessor: (data: TData) => unknown): this {
    return this.cloneWith({ xDataAccessor: dataAccessor });
  }

  public withYDataAccessor(dataAccessor: (data: TData) => unknown): this {
    return this.cloneWith({ yDataAccessor: dataAccessor });
  }

  public withSeries(series: Series<TData>[]): this {
    return this.cloneWith({ series: series });
  }

  public withBands(bands: Band<TData>[]): this {
    return this.cloneWith({ bands: bands });
  }

  public withBounds(bounds: ScaleBounds): this {
    return this.cloneWith({ bounds: bounds });
  }

  public build(axisType: AxisType): AnyCartesianScale<TData> {
    const scaleInitData = this.buildScaleInitData(axisType);

    const scaleType = this.getScaleType(axisType);

    switch (scaleType) {
      case ScaleType.Band:
        return new CartesianBandScale<TData>(axisType, scaleInitData);
      case ScaleType.Time:
        return new CartesianTimeScale<TData>(axisType, scaleInitData);
      case ScaleType.Linear:
      default:
        return new CartesianContinuousScale<TData>(axisType, scaleInitData);
    }
  }

  public buildScaleInitData(axisType: AxisType): ScaleInitializationData<TData> {
    const seriesState = this.buildSeriesState(axisType);

    return {
      ...this.resolveMinMax(axisType),
      bounds: this.bounds,
      dataAccesor: this.getDataAccessor(axisType) as <TDomain>(data: TData) => TDomain,
      allSeriesAndBandSeries: this.allSeriesAndBandSeries,
      seriesState: seriesState
    };
  }

  private getDataAccessor(axisType: AxisType): (data: TData) => unknown {
    if (axisType === AxisType.X) {
      return this.getXDataAccessor();
    }

    return this.getYDataAccessor();
  }

  private getXDataAccessor(): (data: TData) => unknown {
    if (this.scaleState.xDataAccessor) {
      return this.scaleState.xDataAccessor;
    }

    return defaultXDataAccessor;
  }

  private getYDataAccessor(): (data: TData) => unknown {
    if (this.scaleState.yDataAccessor) {
      return this.scaleState.yDataAccessor;
    }

    return defaultYDataAccessor;
  }

  private getScaleType(axisType: AxisType): ScaleType {
    if (this.scaleState.scaleType !== undefined) {
      return this.scaleState.scaleType;
    }

    const axis = this.getAxis(axisType);
    if (axis && axis.scale !== undefined) {
      return axis.scale;
    }

    return getDefaultScaleType(this.getFirstDataValue(axisType));
  }

  private getFirstDataValue(axisType: AxisType): unknown {
    return this.data.map(this.getDataAccessor(axisType)).filter(data => data !== undefined)[0];
  }

  private buildSeriesState(axisType: AxisType): SeriesState<TData> | undefined {
    return axisType === AxisType.Y ? this.buildStackingState() : undefined;
  }

  private buildStackingState(): CartesianStackingState<TData> | undefined {
    const stackingSeriesList = this.allSeriesAndBandSeries.filter(series => series.stacking);

    if (stackingSeriesList.length > 0) {
      const xDataAccessor = this.getXDataAccessor() as (data: TData) => number;
      const yDataAccessor = this.getYDataAccessor() as (data: TData) => number;

      return new CartesianStackingState(stackingSeriesList, xDataAccessor, yDataAccessor);
    }

    return undefined;
  }

  private getAxis(axisType: AxisType): Axis | undefined {
    switch (axisType) {
      case AxisType.Y:
        return this.scaleState.yAxis;
      case AxisType.X:
      default:
        return this.scaleState.xAxis;
    }
  }

  private resolveMinMax(axisType: AxisType): Partial<MinMax> {
    const axis = this.getAxis(axisType);
    const defaultMinMax = this.getDefaultMinMax(axisType);
    const requestedMin = axis && axis.min;
    const requestedMax = axis && axis.max;

    return {
      min: requestedMin !== undefined ? requestedMin : defaultMinMax && defaultMinMax.min,
      max: requestedMax !== undefined ? requestedMax : defaultMinMax && defaultMinMax.max
    };
  }

  private getDefaultMinMax(axisType: AxisType): MinMax | undefined {
    switch (axisType) {
      case AxisType.Y:
        return this.scaleState.defaultYMinMax;
      case AxisType.X:
        return this.scaleState.defaultXMinMax;
      default:
        assertUnreachable(axisType);
    }
  }

  private get bounds(): ScaleBounds {
    if (this.scaleState.bounds !== undefined) {
      return this.scaleState.bounds;
    }

    return {
      startX: 0,
      endX: 0,
      startY: 0,
      endY: 0
    };
  }

  private get allSeriesAndBandSeries(): Series<TData>[] {
    const series = this.scaleState.series !== undefined ? this.scaleState.series.filter(s => !s.hide) : [];
    const bands =
      this.scaleState.bands !== undefined
        ? this.scaleState.bands.filter(r => !r.hide).flatMap(r => [r.upper, r.lower])
        : [];

    return [...series, ...bands];
  }

  private get data(): TData[] {
    const seriesData = this.scaleState.series !== undefined ? this.scaleState.series.flatMap(s => s.data) : [];
    const bandData =
      this.scaleState.bands !== undefined
        ? this.scaleState.bands.flatMap(b => [b.lower.data, b.upper.data].flat())
        : [];

    return [...seriesData, ...bandData];
  }

  private cloneWith(stateChange: Partial<ScaleState<TData, unknown>>): this {
    return new CartesianScaleBuilder({
      ...this.scaleState,
      ...stateChange
    }) as this;
  }
}

// TODO revisit typing
export type AnyCartesianScale<TData> =
  | CartesianContinuousScale<TData>
  | CartesianTimeScale<TData>
  | CartesianBandScale<TData>;

interface MinMax {
  min: number;
  max: number;
}

type ScaleState<TData, TDomain> = Readonly<{
  bounds?: ScaleBounds;
  axisType?: AxisType;
  scaleType?: ScaleType;
  min?: number;
  max?: number;
  xAxis?: Axis;
  yAxis?: Axis;
  defaultXMinMax?: MinMax;
  defaultYMinMax?: MinMax;
  series?: Series<TData>[];
  bands?: Band<TData>[];
  xDataAccessor?(data: TData): TDomain;
  yDataAccessor?(data: TData): TDomain;
}>;
