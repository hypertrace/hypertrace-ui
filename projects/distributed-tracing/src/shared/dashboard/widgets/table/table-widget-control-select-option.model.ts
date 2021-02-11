import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { TableWidgetControlModel } from './table-widget-control.model';

@Model({
  type: 'table-widget-select-option'
})
export class TableWidgetControlSelectOptionModel extends TableWidgetControlModel {
  @ModelProperty({
    key: 'placeholder',
    displayName: 'Placeholder',
    type: STRING_PROPERTY.type
  })
  public placeholder?: string;
}
