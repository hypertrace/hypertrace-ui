import { ArrayPropertyTypeInstance, EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import {
  ARRAY_PROPERTY,
  Model,
  ModelApi,
  ModelProperty,
  ModelPropertyType,
  NUMBER_PROPERTY,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { LegendPosition } from '../../../components/legend/legend.component';
import { RadarWidgetDataFetcher } from './data/radar-data-source.model';
import { RadarSeriesModel } from './series/radar-series.model';

@Model({
  type: 'radar-widget'
})
export class RadarWidgetModel {
  @ModelProperty({
    key: 'title',
    type: STRING_PROPERTY.type
  })
  public title: string = '';

  @ModelProperty({
    key: 'series',
    displayName: 'Series',
    type: ModelPropertyType.TYPE,
    required: true
  })
  public currentSeries!: RadarSeriesModel;

  @ModelProperty({
    key: 'comparison-durations',
    required: false,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ARRAY_PROPERTY.type,
      subtype: {
        key: ENUM_TYPE.type,
        values: [
          ComparisonDuration.PriorHour,
          ComparisonDuration.PriorDay,
          ComparisonDuration.PriorWeek,
          ComparisonDuration.PriorMonth
        ]
      }
    } as ArrayPropertyTypeInstance
  })
  public comparisonDurations: ComparisonDuration[] = [
    ComparisonDuration.PriorHour,
    ComparisonDuration.PriorDay,
    ComparisonDuration.PriorWeek,
    ComparisonDuration.PriorMonth
  ];

  @ModelProperty({
    key: 'legend-position',
    required: false,
    displayName: 'Legend Position',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [LegendPosition.Bottom, LegendPosition.None]
    } as EnumPropertyTypeInstance
  })
  public legendPosition: LegendPosition = LegendPosition.Bottom;

  @ModelProperty({
    key: 'levels',
    displayName: 'levels',
    type: NUMBER_PROPERTY.type,
    required: false
  })
  public levels: number = 10;

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<RadarWidgetDataFetcher> {
    return this.api.getData<RadarWidgetDataFetcher>();
  }
}

export const enum ComparisonDuration {
  PriorHour = 'Prior Hour',
  PriorDay = 'Prior Day',
  PriorWeek = 'Prior Week',
  PriorMonth = 'Prior Month'
}
