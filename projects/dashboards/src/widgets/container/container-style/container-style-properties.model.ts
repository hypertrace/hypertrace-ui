import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';

@Model({
  type: 'container-style-properties'
})
export class ContainerStylesPropertiesModel {
  @ModelProperty({
    key: 'background-color',
    type: STRING_PROPERTY.type,
    required: false
  })
  public backgroundColor?: string;

  @ModelProperty({
    key: 'border-radius',
    type: STRING_PROPERTY.type,
    required: false
  })
  public borderRadius?: string;

  @ModelProperty({
    key: 'padding',
    type: STRING_PROPERTY.type,
    required: false
  })
  public padding?: string;

  @ModelProperty({
    key: 'margin',
    type: STRING_PROPERTY.type,
    required: false
  })
  public margin?: string;

  @ModelProperty({
    key: 'display',
    type: STRING_PROPERTY.type,
    required: false
  })
  public display?: string;

  public getStyleProperties(): Partial<CSSStyleDeclaration> {
    return {
      backgroundColor: this.backgroundColor,
      borderRadius: this.borderRadius,
      padding: this.padding,
      margin: this.margin,
      display: this.display
    };
  }
}
