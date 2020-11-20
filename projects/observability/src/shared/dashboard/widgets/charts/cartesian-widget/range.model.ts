import {
  BOOLEAN_PROPERTY,
  Model,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  NUMBER_PROPERTY,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { SeriesModel } from './series.model';

@Model({
  type: 'range'
})
export class RangeModel<TData> {
  public static readonly DEFAULT_COLOR: string = 'lightgray';
  public static readonly DEFAULT_OPACITY: number = 0.4;

  @ModelProperty({
    key: 'name',
    displayName: 'Name',
    type: STRING_PROPERTY.type
  })
  public name: string = 'New Range';

  @ModelProperty({
    key: 'color',
    displayName: 'Color',
    type: STRING_PROPERTY.type
  })
  public color: string = RangeModel.DEFAULT_COLOR;

  @ModelProperty({
    key: 'opacity',
    displayName: 'Opacity',
    type: NUMBER_PROPERTY.type
  })
  public opacity: number = RangeModel.DEFAULT_OPACITY;

  @ModelProperty({
    key: 'hide',
    displayName: 'hide',
    type: BOOLEAN_PROPERTY.type
  })
  public hide: boolean = false;

  @ModelProperty({
    key: 'upperSeries',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: SeriesModel
    } as ModelModelPropertyTypeInstance,
    required: true
  })
  public upperSeries!: SeriesModel<TData>;

  @ModelProperty({
    key: 'lowerSeries',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: SeriesModel
    } as ModelModelPropertyTypeInstance,
    required: true
  })
  public lowerSeries!: SeriesModel<TData>;
}
