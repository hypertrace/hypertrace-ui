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
export class CartesianWidgetModel {
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
  public series: SeriesModel<MetricTimeseriesInterval>[] = [];

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

  public getSeriesFetcher(): Observable<MetricSeriesFetcher<MetricTimeseriesInterval>> {
    if (this.seriesFromData) {
      return this.api.getData<MetricSeriesFetcher<MetricTimeseriesInterval>>();
    }

    return merge(...this.series.map(series => this.getDecoratedSeriesDataFetcher(series))).pipe(
      toArray(),
      map(dataFetchers => this.combineSeriesDataFetchers(dataFetchers))
    );
  }

  public getBandsFetcher(): Observable<MetricBandFetcher<MetricTimeseriesBandInterval>> {
    return merge(...this.bands.map(band => this.getDecoratedBandsDataFetcher(band))).pipe(
      toArray(),
      map(dataFetchers => this.combineBandsDataFetchers(dataFetchers))
    );
  }

  private combineSeriesDataFetchers(
    dataFetchers: DecoratedSeriesDataFetcher<MetricTimeseriesInterval>[]
  ): MetricSeriesFetcher<MetricTimeseriesInterval> {
    return {
      getRequestedInterval: this.supportsSeriesInterval(dataFetchers)
        ? () => this.combineSeriesCurrentInterval(dataFetchers)
        : undefined,
      getData: interval => this.combineSeries(dataFetchers, interval)
    };
  }

  private combineBandsDataFetchers(
    dataFetchers: DecoratedBandDataFetcher<MetricTimeseriesBandInterval>[]
  ): MetricBandFetcher<MetricTimeseriesBandInterval> {
    return {
      getRequestedInterval: this.supportsBandsInterval(dataFetchers)
        ? () => this.combineBandsCurrentInterval(dataFetchers)
        : undefined,
      getData: interval => this.combineBands(dataFetchers, interval)
    };
  }

  private combineSeriesCurrentInterval(
    dataFetchers: Required<DecoratedSeriesDataFetcher<MetricTimeseriesInterval>>[]
  ): TimeDuration | undefined {
    // If same interval from each, use it
    return intersectionBy(
      dataFetchers.map(fetcher => fetcher.getRequestedInterval()),
      interval => interval && `${interval.value}${interval.unit}`
    )[0];
  }

  private combineBandsCurrentInterval(
    dataFetchers: Required<DecoratedBandDataFetcher<MetricTimeseriesBandInterval>>[]
  ): TimeDuration | undefined {
    // If same interval from each, use it
    return intersectionBy(
      dataFetchers.map(fetcher => fetcher.getRequestedInterval()),
      interval => interval && `${interval.value}${interval.unit}`
    )[0];
  }

  private supportsSeriesInterval(
    dataFetchers: DecoratedSeriesDataFetcher<MetricTimeseriesInterval>[]
  ): dataFetchers is Required<DecoratedSeriesDataFetcher<MetricTimeseriesInterval>>[] {
    return dataFetchers.every(fetcher => fetcher.getRequestedInterval !== undefined);
  }

  private supportsBandsInterval(
    dataFetchers: DecoratedBandDataFetcher<MetricTimeseriesBandInterval>[]
  ): dataFetchers is Required<DecoratedBandDataFetcher<MetricTimeseriesBandInterval>>[] {
    return dataFetchers.every(fetcher => fetcher.getRequestedInterval !== undefined);
  }

  private combineSeries(
    dataFetchers: DecoratedSeriesDataFetcher<MetricTimeseriesInterval>[],
    interval: TimeDuration
  ): Observable<SeriesResult<MetricTimeseriesInterval>[]> {
    return forkJoinSafeEmpty(dataFetchers.map((dataFetcher, index) => this.fetchSeries(dataFetcher, index, interval)));
  }

  private combineBands(
    dataFetchers: DecoratedBandDataFetcher<MetricTimeseriesBandInterval>[],
    interval: TimeDuration
  ): Observable<BandResult<MetricTimeseriesBandInterval>[]> {
    return forkJoinSafeEmpty(dataFetchers.map(dataFetcher => this.fetchBands(dataFetcher, interval)));
  }

  private fetchSeries(
    dataFetcher: DecoratedSeriesDataFetcher<MetricTimeseriesInterval>,
    index: number,
    interval: TimeDuration
  ): Observable<SeriesResult<MetricTimeseriesInterval>> {
    return dataFetcher
      .getData(interval)
      .pipe(map(metricSeries => this.convertToCartesianSeriesData(dataFetcher, metricSeries, index)));
  }

  private fetchBands(
    dataFetcher: DecoratedBandDataFetcher<MetricTimeseriesBandInterval>,
    interval: TimeDuration
  ): Observable<BandResult<MetricTimeseriesBandInterval>> {
    return dataFetcher
      .getData(interval)
      .pipe(map(metricBand => this.convertToCartesianBandData(dataFetcher, metricBand)));
  }

  private convertToCartesianSeriesData(
    dataFetcher: DecoratedSeriesDataFetcher<MetricTimeseriesInterval>,
    metricSeries: MetricSeries<MetricTimeseriesInterval>,
    index: number
  ): SeriesResult<MetricTimeseriesInterval> {
    return {
      series: this.convertToSeries(metricSeries, dataFetcher.series, index)
    };
  }

  private convertToCartesianBandData(
    dataFetcher: DecoratedBandDataFetcher<MetricTimeseriesBandInterval>,
    metricBand: MetricBand<MetricTimeseriesBandInterval>
  ): BandResult<MetricTimeseriesBandInterval> {
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
  ): Series<MetricTimeseriesBandInterval> {
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
    metricSeries: MetricSeries<MetricTimeseriesInterval>,
    model: SeriesModel<MetricTimeseriesInterval>,
    index: number
  ): Series<MetricTimeseriesInterval> {
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

  private getSeriesVizTypeFromModel(
    seriesModel: SeriesModel<MetricTimeseriesInterval>
  ): CartesianSeriesVisualizationType {
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
    series: SeriesModel<MetricTimeseriesInterval>
  ): Observable<DecoratedSeriesDataFetcher<MetricTimeseriesInterval>> {
    return series.getDataFetcher().pipe(
      map(fetcher => ({
        ...fetcher,
        series: series
      }))
    );
  }

  private getDecoratedBandsDataFetcher(
    band: BandModel<MetricTimeseriesBandInterval>
  ): Observable<DecoratedBandDataFetcher<MetricTimeseriesBandInterval>> {
    return band.getDataFetcher().pipe(
      map(fetcher => ({
        ...fetcher,
        band: band
      }))
    );
  }
}

interface DecoratedSeriesDataFetcher<TInterval extends MetricTimeseriesInterval>
  extends MetricSeriesDataFetcher<TInterval> {
  series: SeriesModel<TInterval>;
}

interface DecoratedBandDataFetcher<TInterval extends MetricTimeseriesBandInterval>
  extends MetricBandDataFetcher<TInterval> {
  band: BandModel<TInterval>;
}

export interface MetricSeriesFetcher<TInterval> {
  getData(interval: TimeDuration): Observable<SeriesResult<TInterval>[]>;
  getRequestedInterval?(): TimeDuration | undefined;
}

export interface MetricBandFetcher<TInterval> {
  getData(interval: TimeDuration): Observable<BandResult<TInterval>[]>;
  getRequestedInterval?(): TimeDuration | undefined;
}

export interface SeriesResult<TInterval> {
  series: Series<TInterval>;
}

export interface BandResult<TInterval> {
  baseline: Series<TInterval>;
  band: Band<TInterval>;
}
