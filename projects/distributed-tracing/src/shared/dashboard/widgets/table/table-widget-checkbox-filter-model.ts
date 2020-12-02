import { TableFilter } from '@hypertrace/components';
import { BOOLEAN_PROPERTY, Model, ModelProperty } from '@hypertrace/hyperdash';
import { TableWidgetFilterModel } from './table-widget-filter-model';

@Model({
  type: 'table-widget-checkbox-filter',
  displayName: 'Checkbox Filter'
})
export class TableWidgetCheckboxFilterModel extends TableWidgetFilterModel {
  @ModelProperty({
    key: 'checked',
    displayName: 'Checked',
    type: BOOLEAN_PROPERTY.type,
    required: false
  })
  public checked?: boolean;

  public getTableFilter(): TableFilter {
    return {
      field: this.attribute,
      operator: this.operator,
      value: this.value
    };
  }
}
