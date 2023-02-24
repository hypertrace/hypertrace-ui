import { Color, TimeDuration } from '@hypertrace/common';
import {
  BOOLEAN_PROPERTY,
  Model,
  ModelApi,
  ModelProperty,
  NUMBER_PROPERTY,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';

@Model({
  type: 'band'
})
export class BandModel<TInterval> {
  private static readonly BAND_COLOR: string = Color.Gray2;
  private static readonly BASELINE_COLOR: string = Color.Gray4;
  private static readonly DEFAULT_OPACITY: number = 0.4;
  private static readonly BASELINE_NAME: string = 'Baseline';
  private static readonly UPPER_BOUND_NAME: string = 'Upper Bound';
  private static readonly LOWER_BOUND_NAME: string = 'Lower Bound';

  @ModelProperty({
    key: 'name',
    type: STRING_PROPERTY.type
  })
  public name: string = BandModel.BASELINE_NAME;

  @ModelProperty({
    key: 'upper-bound-name',
    type: STRING_PROPERTY.type
  })
  public upperBoundName: string = BandModel.UPPER_BOUND_NAME;

  @ModelProperty({
    key: 'lower-bound-name',
    type: STRING_PROPERTY.type
  })
  public lowerBoundName: string = BandModel.LOWER_BOUND_NAME;

  @ModelProperty({
    key: 'color',
    type: STRING_PROPERTY.type
  })
  public color: string = BandModel.BASELINE_COLOR;

  @ModelProperty({
    key: 'band-color',
    type: STRING_PROPERTY.type
  })
  public bandColor: string = BandModel.BAND_COLOR;

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

  public getDataFetcher(): Observable<MetricBandDataFetcher<TInterval>> {
    return this.api.getData();
  }
}

export interface MetricBandDataFetcher<TInterval> {
  getData(interval: TimeDuration): Observable<MetricBand<TInterval>>;
}

export interface MetricBand<TInterval> {
  intervals: TInterval[];
  units: string;
}
