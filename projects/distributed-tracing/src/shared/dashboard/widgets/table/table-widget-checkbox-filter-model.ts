import { TableFilter } from '@hypertrace/components';
import {
  BOOLEAN_PROPERTY,
  Model,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { TableWidgetFilterModel } from './table-widget-filter-model';

@Model({
  type: 'table-widget-checkbox-filter',
  displayName: 'Checkbox Filter'
})
export class TableWidgetCheckboxFilterModel {
  @ModelProperty({
    key: 'label',
    displayName: 'Label',
    type: STRING_PROPERTY.type,
    required: true
  })
  public label!: string;

  @ModelProperty({
    key: 'checked',
    displayName: 'Checked',
    type: BOOLEAN_PROPERTY.type,
    required: false
  })
  public checked?: boolean;

  @ModelProperty({
    key: 'checked-filter',
    displayName: 'Checked Filter Option',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: TableWidgetFilterModel
    } as ModelModelPropertyTypeInstance,
    required: true
  })
  public checkedFilter!: TableWidgetFilterModel;

  @ModelProperty({
    key: 'unchecked-filter',
    displayName: 'Checked Filter Option',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: TableWidgetFilterModel
    } as ModelModelPropertyTypeInstance,
    required: true
  })
  public uncheckedFilter!: TableWidgetFilterModel;

  public getTableFilter(checked: boolean): TableFilter {
    return checked ? this.checkedFilter.getTableFilter() : this.uncheckedFilter.getTableFilter();
  }
}
