import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';

@Model({
  type: 'iframe-widget'
})
export class IFrameWidgetModel {
  @ModelProperty({
    key: 'title',
    type: STRING_PROPERTY.type
  })
  public title: string = '';

  @ModelProperty({
    key: 'height',
    type: STRING_PROPERTY.type
  })
  public height: string = '';

  @ModelProperty({
    key: 'width',
    type: STRING_PROPERTY.type
  })
  public width: string = '';

  @ModelProperty({
    key: 'source',
    type: STRING_PROPERTY.type
  })
  public source: string = '';
}
