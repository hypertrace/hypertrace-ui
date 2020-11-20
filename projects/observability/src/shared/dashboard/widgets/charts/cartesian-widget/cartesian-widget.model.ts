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
import { merge, Observable, of } from 'rxjs';
import { map, toArray } from 'rxjs/operators';
import { CartesianSeriesVisualizationType, Series } from '../../../../components/cartesian/chart';
import { LegendPosition } from '../../../../components/legend/legend.component';
import { CartesianAxisModel } from './axis/cartesian-axis.model';
import { RANGE_MODEL_TYPE } from './range-model-type';
import { RangeModel } from './range.model';
import { SERIES_ARRAY_TYPE } from './series-array/series-array-type';
import { SeriesVisualizationType } from './series-visualization/series-visualization-type';
import { MetricSeries, MetricSeriesDataFetcher, SeriesModel } from './series.model';

@Model({
  type: 'cartesian-widget',
  displayName: 'Cartesian Widget'
})
export class CartesianWidgetModel<TData> {
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
  public series: SeriesModel<TData>[] = [];

  @ModelProperty({
    key: 'range',
    type: RANGE_MODEL_TYPE.type
  })
  public range?: RangeModel<TData>;

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

  public getSeriesFetcher(): Observable<MetricSeriesFetcher<TData>> {
    if (this.seriesFromData) {
      return this.api.getData<MetricSeriesFetcher<TData>>();
    }

    return merge(...this.series.map(series => this.getDecoratedSeriesDataFetcher(series))).pipe(
      toArray(),
      map(dataFetchers => this.combineMetricDataFetchers(dataFetchers))
    );
  }

  public getRangeFetcher(): Observable<MetricSeriesFetcher<TData> | undefined> {
    return this.range !== undefined
      ? forkJoinSafeEmpty({
          upperSeries: this.getDecoratedSeriesDataFetcher(this.range.upperSeries),
          lowerSeries: this.getDecoratedSeriesDataFetcher(this.range.lowerSeries)
        }).pipe(
          map(seriesObj => [seriesObj.upperSeries, seriesObj.lowerSeries]),
          map(dataFetchers => this.combineMetricDataFetchers(dataFetchers))
        )
      : of(undefined);
  }

  private combineMetricDataFetchers(dataFetchers: DecoratedSeriesDataFetcher<TData>[]): MetricSeriesFetcher<TData> {
    return {
      getRequestedInterval: this.supportsInterval(dataFetchers)
        ? () => this.combineCurrentInterval(dataFetchers)
        : undefined,
      getData: interval => this.combineSeries(dataFetchers, interval)
    };
  }

  private combineCurrentInterval(
    dataFetchers: Required<DecoratedSeriesDataFetcher<TData>>[]
  ): TimeDuration | undefined {
    // If same interval from each, use it
    return intersectionBy(
      dataFetchers.map(fetcher => fetcher.getRequestedInterval()),
      interval => interval && `${interval.value}${interval.unit}`
    )[0];
  }

  private supportsInterval(
    dataFetchers: DecoratedSeriesDataFetcher<TData>[]
  ): dataFetchers is Required<DecoratedSeriesDataFetcher<TData>>[] {
    return dataFetchers.every(fetcher => fetcher.getRequestedInterval !== undefined);
  }

  private combineSeries(
    dataFetchers: DecoratedSeriesDataFetcher<TData>[],
    interval: TimeDuration
  ): Observable<Series<TData>[]> {
    return forkJoinSafeEmpty(dataFetchers.map((dataFetcher, index) => this.fetchSeries(dataFetcher, index, interval)));
  }

  private fetchSeries(
    dataFetcher: DecoratedSeriesDataFetcher<TData>,
    index: number,
    interval: TimeDuration
  ): Observable<Series<TData>> {
    return dataFetcher
      .getData(interval)
      .pipe(map(metricSeries => this.convertMetricSeriesToSeries(metricSeries, dataFetcher.series, index)));
  }

  private convertMetricSeriesToSeries(
    metricSeries: MetricSeries<TData>,
    model: SeriesModel<TData>,
    index?: number
  ): Series<TData> {
    return {
      data: metricSeries.intervals,
      units: metricSeries.units,
      summary: this.showSummary ? metricSeries.summary : undefined,
      color:
        model.color !== SeriesModel.DEFAULT_COLOR
          ? model.color // Use series color if user specified
          : this.colorPaletteKey !== undefined // Else check if the user provided the widget a color palette
          ? index !== undefined
            ? this.colorService.getColorPalette(this.colorPaletteKey).forNColors(this.series.length)[index]
            : model.color
          : model.color, // No, specified series color and no widget palette so use default series color
      name: model.name,
      type: this.getVizTypeFromModel(model),
      stacking: model.stacking,
      hide: model.hide
    };
  }

  private getVizTypeFromModel(seriesModel: SeriesModel<TData>): CartesianSeriesVisualizationType {
    switch (seriesModel.visualizationType) {
      case SeriesVisualizationType.Area:
        return CartesianSeriesVisualizationType.Area;
      case SeriesVisualizationType.Scatter:
        return CartesianSeriesVisualizationType.Scatter;
      case SeriesVisualizationType.Column:
        return CartesianSeriesVisualizationType.Column;
      case SeriesVisualizationType.Dashed:
        return CartesianSeriesVisualizationType.Dashed;
      case SeriesVisualizationType.Line:
      default:
        return CartesianSeriesVisualizationType.Line;
    }
  }

  private getDecoratedSeriesDataFetcher(series: SeriesModel<TData>): Observable<DecoratedSeriesDataFetcher<TData>> {
    return series.getDataFetcher().pipe(
      map(fetcher => ({
        ...fetcher,
        series: series
      }))
    );
  }
}

interface DecoratedSeriesDataFetcher<TData> extends MetricSeriesDataFetcher<TData> {
  series: SeriesModel<TData>;
}

export interface MetricSeriesFetcher<TInterval> {
  getData(interval: TimeDuration): Observable<Series<TInterval>[]>;
  getRequestedInterval?(): TimeDuration | undefined;
}
