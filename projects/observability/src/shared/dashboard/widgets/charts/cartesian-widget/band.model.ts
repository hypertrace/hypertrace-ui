import { Color } from '@hypertrace/common';
import {
  BOOLEAN_PROPERTY,
  Model,
  ModelApi,
  ModelProperty,
  NUMBER_PROPERTY,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';

@Model({
  type: 'band'
})
export class BandModel {
  public static readonly BAND_COLOR: string = Color.Gray1;
  public static readonly BASELINE_COLOR: string = Color.Gray4;
  public static readonly BASELINE_NAME: string = 'Baseline';
  public static readonly UPPER_BOUND_NAME: string = 'Upper Bound';
  public static readonly LOWER_BOUND_NAME: string = 'Lower Bound';
  public static readonly DEFAULT_OPACITY: number = 0.4;

  @ModelProperty({
    key: 'band-color',
    type: STRING_PROPERTY.type
  })
  public bandColor: string = BandModel.BAND_COLOR;

  @ModelProperty({
    key: 'baseline-color',
    type: STRING_PROPERTY.type
  })
  public baselineColor: string = BandModel.BASELINE_COLOR;

  @ModelProperty({
    key: 'opacity',
    displayName: 'Opacity',
    type: NUMBER_PROPERTY.type
  })
  public opacity: number = BandModel.DEFAULT_OPACITY;

  @ModelProperty({
    key: 'hide',
    displayName: 'hide',
    type: BOOLEAN_PROPERTY.type
  })
  public hide: boolean = false;

  @ModelInject(MODEL_API)
  public api!: ModelApi;
}
