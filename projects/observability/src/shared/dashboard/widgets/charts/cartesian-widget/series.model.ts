import { TimeDuration } from '@hypertrace/common';
import { EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import { BOOLEAN_PROPERTY, Model, ModelApi, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { SeriesVisualizationType } from './series-visualization/series-visualization-type';

@Model({
  type: 'series' // Todo : Add supported data types -> EntityMetricTimeseriesDataSourceModel
})
export class SeriesModel<TData> {
  public static readonly DEFAULT_COLOR: string = 'steelblue';

  // TODO make optional, calculate defaults, subclass/compose for different types of viz
  @ModelProperty({
    key: 'name',
    displayName: 'Name',
    type: STRING_PROPERTY.type
  })
  public name: string = 'New Series';

  @ModelProperty({
    key: 'color',
    displayName: 'Color',
    type: STRING_PROPERTY.type
  })
  public color: string = SeriesModel.DEFAULT_COLOR;

  @ModelProperty({
    key: 'stacking',
    displayName: 'Stacking',
    type: BOOLEAN_PROPERTY.type
  })
  public stacking: boolean = false;

  @ModelProperty({
    key: 'hide',
    displayName: 'hide',
    type: BOOLEAN_PROPERTY.type
  })
  public hide: boolean = false;

  @ModelProperty({
    key: 'visualization-type',
    displayName: 'Visualization Type',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [
        SeriesVisualizationType.Area,
        SeriesVisualizationType.Line,
        SeriesVisualizationType.Dashed,
        SeriesVisualizationType.Scatter,
        SeriesVisualizationType.Column
      ]
    } as EnumPropertyTypeInstance
  })
  public visualizationType: SeriesVisualizationType = SeriesVisualizationType.Area;

  @ModelInject(MODEL_API)
  public api!: ModelApi;

  public getDataFetcher(): Observable<MetricSeriesDataFetcher<TData>> {
    return this.api.getData();
  }
}

export interface MetricSeriesDataFetcher<TInterval> {
  getData(interval: TimeDuration): Observable<MetricSeries<TInterval>>;
  getRequestedInterval?(): TimeDuration | undefined;
}

export interface MetricSeries<TInterval> {
  intervals: TInterval[];
  units: string;
  summary?: { value: number; units?: string };
}
