import { ModelTemplatePropertyType } from '@hypertrace/dashboards';
import { Model, ModelJson, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';

@Model({
  type: 'table-widget-view'
})
export class TableWidgetViewModel {
  @ModelProperty({
    key: 'label',
    type: STRING_PROPERTY.type
  })
  public label!: string;

  @ModelProperty({
    key: 'template',
    type: ModelTemplatePropertyType.TYPE
  })
  public template!: ModelJson;
}
