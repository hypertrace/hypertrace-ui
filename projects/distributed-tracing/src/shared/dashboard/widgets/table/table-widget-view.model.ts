import { ModelTemplatePropertyType } from '@hypertrace/dashboards';
import { Model, ModelJson, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
@Model({
  type: 'table-widget-view'
})
export class TableWidgetViewModel {
  @ModelProperty({
    key: 'view',
    type: STRING_PROPERTY.type
  })
  public view!: string;

  @ModelProperty({
    key: 'template',
    type: ModelTemplatePropertyType.TYPE
  })
  public template!: ModelJson;
}
