import { ColorPaletteKey, ColorService, forkJoinSafeEmpty, TimeDuration } from '@hypertrace/common';
import { EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import {
  BOOLEAN_PROPERTY,
  Model,
  ModelApi,
  ModelProperty,
  ModelPropertyType,
  NUMBER_PROPERTY,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { intersectionBy } from 'lodash-es';
import { merge, Observable } from 'rxjs';
import { map, toArray } from 'rxjs/operators';
import { Band, CartesianSeriesVisualizationType, Series } from '../../../../components/cartesian/chart';
import { LegendPosition } from '../../../../components/legend/legend.component';
import {
  MetricTimeseriesBandInterval,
  MetricTimeseriesInterval
} from '../../../../graphql/model/metric/metric-timeseries';
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
export class CartesianWidgetModel<TSeriesInterval> {
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
  public series: SeriesModel<TSeriesInterval>[] = [];

  @ModelProperty({
    key: 'bands',
    type: BAND_ARRAY_TYPE.type
  })
  public bands: BandModel<MetricTimeseriesBandInterval>[] = [];

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

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  @ModelInject(ColorService)
  private readonly colorService!: ColorService;

  public getSeriesFetcher(): Observable<MetricSeriesFetcher<TSeriesInterval>> {
    if (this.seriesFromData) {
      return this.api.getData<MetricSeriesFetcher<TSeriesInterval>>();
    }

    return merge(...this.series.map(series => this.getDecoratedSeriesDataFetcher(series))).pipe(
      toArray(),
      map(dataFetchers => this.combineSeriesDataFetchers(dataFetchers))
    );
  }

  public getBandsFetcher(): Observable<MetricBandFetcher<MetricTimeseriesInterval>> {
    return merge(...this.bands.map(band => this.getDecoratedBandsDataFetcher(band))).pipe(
      toArray(),
      map(dataFetchers => this.combineBandsDataFetchers(dataFetchers))
    );
  }

  private combineSeriesDataFetchers(
    dataFetchers: DecoratedSeriesDataFetcher<TSeriesInterval>[]
  ): MetricSeriesFetcher<TSeriesInterval> {
    return {
      getRequestedInterval: this.supportsSeriesInterval(dataFetchers)
        ? () => this.combineSeriesCurrentInterval(dataFetchers)
        : undefined,
      getData: interval => this.combineSeries(dataFetchers, interval)
    };
  }

  private combineBandsDataFetchers(
    dataFetchers: DecoratedBandDataFetcher[]
  ): MetricBandFetcher<MetricTimeseriesInterval> {
    return {
      getRequestedInterval: this.supportsBandsInterval(dataFetchers)
        ? () => this.combineBandsCurrentInterval(dataFetchers)
        : undefined,
      getData: interval => this.combineBands(dataFetchers, interval)
    };
  }

  private combineSeriesCurrentInterval(
    dataFetchers: Required<DecoratedSeriesDataFetcher<TSeriesInterval>>[]
  ): TimeDuration | undefined {
    // If same interval from each, use it
    return intersectionBy(
      dataFetchers.map(fetcher => fetcher.getRequestedInterval()),
      interval => interval && `${interval.value}${interval.unit}`
    )[0];
  }

  private combineBandsCurrentInterval(dataFetchers: Required<DecoratedBandDataFetcher>[]): TimeDuration | undefined {
    // If same interval from each, use it
    return intersectionBy(
      dataFetchers.map(fetcher => fetcher.getRequestedInterval()),
      interval => interval && `${interval.value}${interval.unit}`
    )[0];
  }

  private supportsSeriesInterval(
    dataFetchers: DecoratedSeriesDataFetcher<TSeriesInterval>[]
  ): dataFetchers is Required<DecoratedSeriesDataFetcher<TSeriesInterval>>[] {
    return dataFetchers.every(fetcher => fetcher.getRequestedInterval !== undefined);
  }

  private supportsBandsInterval(
    dataFetchers: DecoratedBandDataFetcher[]
  ): dataFetchers is Required<DecoratedBandDataFetcher>[] {
    return dataFetchers.every(fetcher => fetcher.getRequestedInterval !== undefined);
  }

  private combineSeries(
    dataFetchers: DecoratedSeriesDataFetcher<TSeriesInterval>[],
    interval: TimeDuration
  ): Observable<SeriesResult<TSeriesInterval>[]> {
    return forkJoinSafeEmpty(dataFetchers.map((dataFetcher, index) => this.fetchSeries(dataFetcher, index, interval)));
  }

  private combineBands(
    dataFetchers: DecoratedBandDataFetcher[],
    interval: TimeDuration
  ): Observable<BandResult<MetricTimeseriesInterval>[]> {
    return forkJoinSafeEmpty(dataFetchers.map(dataFetcher => this.fetchBands(dataFetcher, interval)));
  }

  private fetchSeries(
    dataFetcher: DecoratedSeriesDataFetcher<TSeriesInterval>,
    index: number,
    interval: TimeDuration
  ): Observable<SeriesResult<TSeriesInterval>> {
    return dataFetcher
      .getData(interval)
      .pipe(map(metricSeries => this.convertToCartesianSeriesData(dataFetcher, metricSeries, index)));
  }

  private fetchBands(
    dataFetcher: DecoratedBandDataFetcher,
    interval: TimeDuration
  ): Observable<BandResult<MetricTimeseriesInterval>> {
    return dataFetcher
      .getData(interval)
      .pipe(map(metricBand => this.convertToCartesianBandData(dataFetcher, metricBand)));
  }

  private convertToCartesianSeriesData(
    dataFetcher: DecoratedSeriesDataFetcher<TSeriesInterval>,
    metricSeries: MetricSeries<TSeriesInterval>,
    index: number
  ): SeriesResult<TSeriesInterval> {
    return {
      series: this.convertToSeries(metricSeries, dataFetcher.series, index)
    };
  }

  private convertToCartesianBandData(
    dataFetcher: DecoratedBandDataFetcher,
    metricBand: MetricBand<MetricTimeseriesBandInterval>
  ): BandResult<MetricTimeseriesInterval> {
    return {
      baseline: this.convertToBaseline(metricBand, dataFetcher.band),
      band: this.convertToBand(metricBand)
    };
  }

  private convertToBand(metricSeries: MetricSeries<MetricTimeseriesBandInterval>): Band<MetricTimeseriesBandInterval> {
    return {
      name: '',
      color: BandModel.BAND_COLOR,
      opacity: BandModel.DEFAULT_OPACITY,
      upper: {
        data: metricSeries.intervals.map((interval: MetricTimeseriesBandInterval) => ({
          ...interval,
          value: interval.upperBound
        })),
        type: CartesianSeriesVisualizationType.DashedLine,
        color: BandModel.BAND_COLOR,
        name: BandModel.UPPER_BOUND_NAME
      },
      lower: {
        data: metricSeries.intervals.map((interval: MetricTimeseriesBandInterval) => ({
          ...interval,
          value: interval.lowerBound
        })),
        type: CartesianSeriesVisualizationType.DashedLine,
        color: BandModel.BAND_COLOR,
        name: BandModel.LOWER_BOUND_NAME
      }
    };
  }

  private convertToBaseline(
    metricBand: MetricBand<MetricTimeseriesBandInterval>,
    model: BandModel<MetricTimeseriesBandInterval>
  ): Series<MetricTimeseriesInterval> {
    return {
      data: metricBand.intervals,
      units: metricBand.units,
      color: BandModel.BASELINE_COLOR,
      name: BandModel.BASELINE_NAME,
      type: CartesianSeriesVisualizationType.DashedLine,
      hide: model.hide
    };
  }

  private convertToSeries(
    metricSeries: MetricSeries<TSeriesInterval>,
    model: SeriesModel<TSeriesInterval>,
    index: number
  ): Series<TSeriesInterval> {
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

  private getSeriesVizTypeFromModel(seriesModel: SeriesModel<TSeriesInterval>): CartesianSeriesVisualizationType {
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

  private getDecoratedSeriesDataFetcher(
    series: SeriesModel<TSeriesInterval>
  ): Observable<DecoratedSeriesDataFetcher<TSeriesInterval>> {
    return series.getDataFetcher().pipe(
      map(fetcher => ({
        ...fetcher,
        series: series
      }))
    );
  }

  private getDecoratedBandsDataFetcher(
    band: BandModel<MetricTimeseriesBandInterval>
  ): Observable<DecoratedBandDataFetcher> {
    return band.getDataFetcher().pipe(
      map(fetcher => ({
        ...fetcher,
        band: band
      }))
    );
  }
}

interface DecoratedSeriesDataFetcher<TInterval> extends MetricSeriesDataFetcher<TInterval> {
  series: SeriesModel<TInterval>;
}

interface DecoratedBandDataFetcher extends MetricBandDataFetcher<MetricTimeseriesBandInterval> {
  band: BandModel<MetricTimeseriesBandInterval>;
}

export interface MetricSeriesFetcher<TInterval> {
  getData(interval: TimeDuration): Observable<SeriesResult<TInterval>[]>;
  getRequestedInterval?(): TimeDuration | undefined;
}

export interface MetricBandFetcher<TSeriesInterval> {
  getData(interval: TimeDuration): Observable<BandResult<TSeriesInterval>[]>;
  getRequestedInterval?(): TimeDuration | undefined;
}

export interface SeriesResult<TInterval> {
  series: Series<TInterval>;
}

export interface BandResult<TSeriesInterval> {
  baseline: Series<TSeriesInterval>;
  band: Band<MetricTimeseriesBandInterval>;
}
