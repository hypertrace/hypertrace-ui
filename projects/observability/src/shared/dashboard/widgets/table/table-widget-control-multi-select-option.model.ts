import { Model } from '@hypertrace/hyperdash';
import { TableWidgetControlSelectOptionModel } from './table-widget-control-select-option.model';

@Model({
  type: 'table-widget-multi-select-option'
})
export class TableWidgetControlMultiSelectOptionModel extends TableWidgetControlSelectOptionModel {
  public readonly isMultiselect: boolean = true;
}
