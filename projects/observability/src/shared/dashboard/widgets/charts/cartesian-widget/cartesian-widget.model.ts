import { ColorPaletteKey, ColorService, forkJoinSafeEmpty, TimeDuration } from '@hypertrace/common';
import { ENUM_TYPE, EnumPropertyTypeInstance } from '@hypertrace/dashboards';
import {
  BOOLEAN_PROPERTY,
  Model,
  ModelApi,
  ModelProperty,
  ModelPropertyType,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { MODEL_API, ModelInject } from '@hypertrace/hyperdash-angular';
import { intersectionBy } from 'lodash';
import { merge, Observable } from 'rxjs';
import { map, toArray } from 'rxjs/operators';
import { CartesianSeriesVisualizationType, Series } from '../../../../components/cartesian/chart';
import { LegendPosition } from '../../../../components/legend/legend.component';
import { MetricSeries, MetricSeriesDataFetcher, SeriesModel } from '../series.model';
import { CartesianAxisModel } from './axis/cartesian-axis.model';
import { SERIES_ARRAY_TYPE } from './series-array/series-array-type';
import { SeriesVisualizationType } from './series-visualization/series-visualization-type';

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

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  @ModelInject(ColorService)
  private readonly colorService!: ColorService;

  public getSeriesFetcher(): Observable<MetricSeriesFetcher<TData>> {
    if (this.seriesFromData) {
      return this.api.getData<MetricSeriesFetcher<TData>>();
    }

    return merge(...this.series.map(series => this.getDecoratedDataFetcher(series))).pipe(
      toArray(),
      map(dataFetchers => this.combineDataFetchers(dataFetchers))
    );
  }

  private combineDataFetchers(dataFetchers: DecoratedDataFetcher<TData>[]): MetricSeriesFetcher<TData> {
    return {
      getRequestedInterval: this.supportsInterval(dataFetchers)
        ? () => this.combineCurrentInterval(dataFetchers)
        : undefined,
      getData: interval => this.combineSeries(dataFetchers, interval)
    };
  }

  private combineCurrentInterval(dataFetchers: Required<DecoratedDataFetcher<TData>>[]): TimeDuration | undefined {
    // If same interval from each, use it
    return intersectionBy(
      dataFetchers.map(fetcher => fetcher.getRequestedInterval()),
      interval => interval && `${interval.value}${interval.unit}`
    )[0];
  }

  private supportsInterval(
    dataFetchers: DecoratedDataFetcher<TData>[]
  ): dataFetchers is Required<DecoratedDataFetcher<TData>>[] {
    return dataFetchers.every(fetcher => fetcher.getRequestedInterval !== undefined);
  }

  private combineSeries(
    dataFetchers: DecoratedDataFetcher<TData>[],
    interval: TimeDuration
  ): Observable<Series<TData>[]> {
    return forkJoinSafeEmpty(dataFetchers.map((dataFetcher, index) => this.fetchSeries(dataFetcher, index, interval)));
  }

  private fetchSeries(
    dataFetcher: DecoratedDataFetcher<TData>,
    index: number,
    interval: TimeDuration
  ): Observable<Series<TData>> {
    return dataFetcher
      .getData(interval)
      .pipe(map(metricSeries => this.convertToSeries(metricSeries, dataFetcher.series, index)));
  }

  private convertToSeries(metricSeries: MetricSeries<TData>, model: SeriesModel<TData>, index: number): Series<TData> {
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
      case SeriesVisualizationType.Line:
      default:
        return CartesianSeriesVisualizationType.Line;
    }
  }

  private getDecoratedDataFetcher(series: SeriesModel<TData>): Observable<DecoratedDataFetcher<TData>> {
    return series.getDataFetcher().pipe(
      map(fetcher => ({
        ...fetcher,
        series: series
      }))
    );
  }
}

interface DecoratedDataFetcher<TData> extends MetricSeriesDataFetcher<TData> {
  series: SeriesModel<TData>;
}

export interface MetricSeriesFetcher<TInterval> {
  getData(interval: TimeDuration): Observable<Series<TInterval>[]>;
  getRequestedInterval?(): TimeDuration | undefined;
}
