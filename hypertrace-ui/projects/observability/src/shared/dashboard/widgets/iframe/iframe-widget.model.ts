import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';

@Model({
  type: 'iframe-widget',
})
export class IFrameWidgetModel {
  @ModelProperty({
    key: 'source',
    type: STRING_PROPERTY.type,
  })
  public source: string = '';
}
