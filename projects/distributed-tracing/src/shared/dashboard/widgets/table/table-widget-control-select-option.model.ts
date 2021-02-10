import { Model } from '@hypertrace/hyperdash';
import { TableWidgetControlModelBase } from './table-widget-control-model-base';

@Model({
  type: 'table-widget-select-option'
})
export class TableWidgetControlSelectOptionModel extends TableWidgetControlModelBase {}
