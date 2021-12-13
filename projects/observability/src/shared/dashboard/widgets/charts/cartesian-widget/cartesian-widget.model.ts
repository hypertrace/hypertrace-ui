import { ColorPaletteKey, ColorService, forkJoinSafeEmpty, TimeDuration } from '@hypertrace/common';
import { EnumPropertyTypeInstance, ENUM_TYPE, TimeDurationModel } from '@hypertrace/dashboards';
import {
  BOOLEAN_PROPERTY,
  Model,
  ModelApi,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  NUMBER_PROPERTY,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Band, CartesianSeriesVisualizationType, Series } from '../../../../components/cartesian/chart';
import { LegendPosition } from '../../../../components/legend/legend.component';
import { MetricTimeseriesBandInterval } from '../../../../graphql/model/metric/metric-timeseries';
import { CartesianAxisModel } from './axis/cartesian-axis.model';
import { BAND_ARRAY_TYPE } from './band-array/band-array-type';
import { BandModel, MetricBand, MetricBandDataFetcher } from './band.model';
import { SERIES_ARRAY_TYPE } from './series-array/series-array-type';
import { SeriesVisualizationType } from './series-visualization/series-visualization-type';
import { MetricSeries, MetricSeriesDataFetcher, SeriesModel } from './series.model';

@Model({
  type: 'cartesian-widget',
  displayName: 'Cartesian Widget'
})
export class CartesianWidgetModel<TInterval> {
  @ModelProperty({
    key: 'title',
    displayName: 'Title',
    type: STRING_PROPERTY.type,
    required: false
  })
  public title?: string;

  @ModelProperty({
    key: 'series',
    displayName: 'Series',
    type: SERIES_ARRAY_TYPE.type
  })
  public series: SeriesModel<TInterval>[] = [];

  @ModelProperty({
    key: 'bands',
    type: BAND_ARRAY_TYPE.type
  })
  public bands: BandModel<TInterval>[] = [];

  @ModelProperty({
    key: 'show-bands',
    type: BOOLEAN_PROPERTY.type
  })
  public showBands: boolean = false;

  @ModelProperty({
    key: 'color-palette',
    displayName: 'Color Palette',
    type: STRING_PROPERTY.type
  })
  public colorPaletteKey?: ColorPaletteKey;

  @ModelProperty({
    key: 'series-from-data',
    type: BOOLEAN_PROPERTY.type
  })
  public seriesFromData?: boolean = false;

  @ModelProperty({
    key: 'x-axis',
    displayName: 'X Axis',
    type: ModelPropertyType.TYPE
  })
  public xAxis?: CartesianAxisModel;

  @ModelProperty({
    key: 'y-axis',
    displayName: 'Y Axis',
    type: ModelPropertyType.TYPE
  })
  public yAxis?: CartesianAxisModel;

  @ModelProperty({
    key: 'show-x-axis',
    displayName: 'Show X Axis',
    type: BOOLEAN_PROPERTY.type
  })
  public showXAxis: boolean = true;

  @ModelProperty({
    key: 'show-y-axis',
    displayName: 'Show Y Axis',
    type: BOOLEAN_PROPERTY.type
  })
  public showYAxis: boolean = false;

  @ModelProperty({
    key: 'selectable-interval',
    displayName: 'Selectable Interval',
    type: BOOLEAN_PROPERTY.type
  })
  public selectableInterval: boolean = true;

  @ModelProperty({
    key: 'default-interval',
    required: false,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE
    } as ModelModelPropertyTypeInstance
  })
  public defaultInterval?: TimeDurationModel;

  @ModelProperty({
    key: 'show-summary',
    displayName: 'Show Summary',
    type: BOOLEAN_PROPERTY.type
  })
  public showSummary: boolean = false;

  @ModelProperty({
    key: 'legend-position',
    displayName: 'Legend Position',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [
        // LegendPosition.Top intentionally not allowed
        LegendPosition.TopLeft,
        LegendPosition.TopRight,
        LegendPosition.Bottom,
        LegendPosition.Right,
        LegendPosition.None
      ]
    } as EnumPropertyTypeInstance
  })
  public legendPosition: LegendPosition = LegendPosition.TopRight;

  @ModelProperty({
    key: 'max-series-data-points',
    required: false,
    displayName: 'Maximum Data Points',
    type: NUMBER_PROPERTY.type
  })
  public maxSeriesDataPoints?: number;

  @ModelProperty({
    key: 'mouse-sync',
    type: BOOLEAN_PROPERTY.type
  })
  public mouseSync?: boolean = false;

  @ModelProperty({
    key: 'sync-group-id',
    type: STRING_PROPERTY.type
  })
  public syncGroupId?: string;

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  @ModelInject(ColorService)
  private readonly colorService!: ColorService;

  public getDataFetcher(): Observable<CartesianDataFetcher<TInterval>> {
    if (this.seriesFromData) {
      return this.api.getData<CartesianDataFetcher<TInterval>>();
    }

    return forkJoinSafeEmpty({
      series: this.getDecoratedSeriesDataFetchers(),
      bands: this.getDecoratedBandsDataFetchers()
    }).pipe(map((decoratedFetchers: DataFetchers<TInterval>) => this.combineDataFetchers(decoratedFetchers)));
  }

  private combineDataFetchers(decoratedFetchers: DataFetchers<TInterval>): CartesianDataFetcher<TInterval> {
    return {
      getData: (interval: TimeDuration) =>
        this.getCombinedData(interval, decoratedFetchers.series, decoratedFetchers.bands)
    };
  }

  private getCombinedData(
    interval: TimeDuration,
    series: DecoratedSeriesDataFetcher<TInterval>[],
    bands: DecoratedBandDataFetcher<TInterval>[]
  ): Observable<CartesianResult<TInterval>> {
    return forkJoinSafeEmpty({
      series: this.fetchAllSeries(series, interval),
      bands: this.fetchAllBands(bands, interval)
    }).pipe(
      map((result: CombinedResult<TInterval>) => ({
        series: [
          ...result.series.map((s: MetricSeries<TInterval>, index: number) =>
            this.mapToSeries(series[index].seriesModel, s, index)
          ),
          ...result.bands.map((b: MetricBand<TInterval>, index: number) =>
            this.mapToBaseline(bands[index].bandModel, b)
          )
        ],
        bands: result.bands.map((b: MetricBand<TInterval>, index: number) => this.mapToBand(bands[index].bandModel, b))
      }))
    );
  }

  private mapToSeries(
    model: SeriesModel<TInterval>,
    metricSeries: MetricSeries<TInterval>,
    index: number
  ): Series<TInterval> {
    return {
      data: metricSeries.intervals,
      units: metricSeries.units,
      summary: this.showSummary ? metricSeries.summary : undefined,
      color:
        model.color !== SeriesModel.DEFAULT_COLOR
          ? model.color // Use series color if user specified
          : this.colorPaletteKey !== undefined // Else check if the user provided the widget a color palette
          ? this.colorService.getColorPalette(this.colorPaletteKey).forNColors(this.series.length)[index]
          : model.color, // No, specified series color and no widget palette so use default series color
      name: model.name,
      type: this.getSeriesVizTypeFromModel(model),
      stacking: model.stacking,
      hide: model.hide
    };
  }

  private mapToBaseline(model: BandModel<TInterval>, metricBand: MetricBand<TInterval>): Series<TInterval> {
    return {
      data: metricBand.intervals,
      units: metricBand.units,
      color: model.color,
      name: model.name,
      type: CartesianSeriesVisualizationType.DashedLine,
      hide: model.hide
    };
  }

  private mapToBand(model: BandModel<TInterval>, metricSeries: MetricSeries<TInterval>): Band<TInterval> {
    return {
      name: '',
      color: model.bandColor,
      opacity: model.opacity,
      upper: {
        data: metricSeries.intervals
          .map((interval: unknown) => interval as MetricTimeseriesBandInterval)
          .map(
            (interval: MetricTimeseriesBandInterval) =>
              ({
                ...interval,
                value: interval.upperBound
              } as unknown)
          )
          .map(interval => interval as TInterval),
        type: CartesianSeriesVisualizationType.DashedLine,
        color: model.bandColor,
        name: model.upperBoundName
      },
      lower: {
        data: metricSeries.intervals
          .map((interval: unknown) => interval as MetricTimeseriesBandInterval)
          .map(
            (interval: MetricTimeseriesBandInterval) =>
              ({
                ...interval,
                value: interval.lowerBound
              } as unknown)
          )
          .map(interval => interval as TInterval),
        type: CartesianSeriesVisualizationType.DashedLine,
        color: model.bandColor,
        name: model.lowerBoundName
      }
    };
  }

  private fetchAllSeries(
    series: DecoratedSeriesDataFetcher<TInterval>[],
    interval: TimeDuration
  ): Observable<MetricSeries<TInterval>[]> {
    return forkJoinSafeEmpty(series.map(fetcher => fetcher.getData(interval)));
  }

  private fetchAllBands(
    bands: DecoratedBandDataFetcher<TInterval>[],
    interval: TimeDuration
  ): Observable<MetricBand<TInterval>[]> {
    return this.showBands ? forkJoinSafeEmpty(bands.map(fetcher => fetcher.getData(interval))) : of([]);
  }

  private getDecoratedSeriesDataFetchers(): Observable<DecoratedSeriesDataFetcher<TInterval>[]> {
    return forkJoinSafeEmpty(this.series.map(seriesModel => this.getDecoratedSeriesDataFetcher(seriesModel)));
  }

  private getDecoratedBandsDataFetchers(): Observable<DecoratedBandDataFetcher<TInterval>[]> {
    return forkJoinSafeEmpty(this.bands.map(bandModel => this.getDecoratedBandsDataFetcher(bandModel)));
  }

  private getDecoratedSeriesDataFetcher(
    seriesModel: SeriesModel<TInterval>
  ): Observable<DecoratedSeriesDataFetcher<TInterval>> {
    return seriesModel.getDataFetcher().pipe(
      map(fetcher => ({
        ...fetcher,
        seriesModel: seriesModel
      }))
    );
  }

  private getDecoratedBandsDataFetcher(
    bandModel: BandModel<TInterval>
  ): Observable<DecoratedBandDataFetcher<TInterval>> {
    return bandModel.getDataFetcher().pipe(
      map(fetcher => ({
        ...fetcher,
        bandModel: bandModel
      }))
    );
  }

  private getSeriesVizTypeFromModel(seriesModel: SeriesModel<TInterval>): CartesianSeriesVisualizationType {
    switch (seriesModel.visualizationType) {
      case SeriesVisualizationType.Area:
        return CartesianSeriesVisualizationType.Area;
      case SeriesVisualizationType.Scatter:
        return CartesianSeriesVisualizationType.Scatter;
      case SeriesVisualizationType.Column:
        return CartesianSeriesVisualizationType.Column;
      case SeriesVisualizationType.Line:
      default:
        return CartesianSeriesVisualizationType.Line;
    }
  }
}

interface DataFetchers<TInterval> {
  series: DecoratedSeriesDataFetcher<TInterval>[];
  bands: DecoratedBandDataFetcher<TInterval>[];
}

interface DecoratedSeriesDataFetcher<TInterval> extends MetricSeriesDataFetcher<TInterval> {
  seriesModel: SeriesModel<TInterval>;
}

interface DecoratedBandDataFetcher<TInterval> extends MetricBandDataFetcher<TInterval> {
  bandModel: BandModel<TInterval>;
}

export interface CartesianDataFetcher<TInterval> {
  getData(interval?: TimeDuration): Observable<CartesianResult<TInterval>>;
}

export interface CombinedResult<TInterval> {
  series: MetricSeries<TInterval>[];
  bands: MetricBand<TInterval>[];
}

export interface CartesianResult<TInterval> {
  series: Series<TInterval>[];
  bands: Band<TInterval>[];
}
