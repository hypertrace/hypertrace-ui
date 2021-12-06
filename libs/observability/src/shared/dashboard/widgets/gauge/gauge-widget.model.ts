import {
  ARRAY_PROPERTY,
  Model,
  ModelApi,
  ModelProperty,
  NUMBER_PROPERTY,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GaugeWidgetData } from './gauge-widget';
import { GaugeThresholdModel } from './thresholds/gauge-threshold.model';
@Model({
  type: 'gauge-widget'
})
export class GaugeWidgetModel {
  @ModelProperty({
    key: 'title',
    type: STRING_PROPERTY.type
  })
  public title?: string;

  @ModelProperty({
    key: 'max-value',
    type: NUMBER_PROPERTY.type,
    required: true
  })
  public maxValue!: number;

  @ModelProperty({
    key: 'thresholds',
    type: ARRAY_PROPERTY.type,
    required: true
  })
  public thresholds!: GaugeThresholdModel[];

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<GaugeWidgetData> {
    return this.api.getData<number>().pipe(
      map(value => ({
        value: value,
        maxValue: this.maxValue,
        thresholds: this.thresholds
      }))
    );
  }
}
