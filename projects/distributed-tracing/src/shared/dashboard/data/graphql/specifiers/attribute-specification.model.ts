import { Dictionary } from '@hypertrace/common';
import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { Specification } from '../../../../graphql/model/schema/specifier/specification';
import { SpecificationBuilder } from '../../../../graphql/request/builders/specification/specification-builder';
import { SpecificationModel } from './specification.model';

@Model({
  type: 'attribute-specification',
  displayName: 'Attribute'
})
export class AttributeSpecificationModel extends SpecificationModel<Specification> {
  @ModelProperty({
    key: 'attribute',
    displayName: 'Attribute',
    type: STRING_PROPERTY.type, // TODO make this its own property
    required: true
  })
  public attribute!: string;

  protected buildInnerSpec(): Specification {
    return new SpecificationBuilder().attributeSpecificationForKey(this.attribute);
  }

  public extractFromServerData(resultContainer: Dictionary<unknown>): unknown {
    return this.innerSpec.extractFromServerData(resultContainer);
  }
}
