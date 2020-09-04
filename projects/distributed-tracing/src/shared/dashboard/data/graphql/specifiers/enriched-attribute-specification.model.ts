import { Dictionary } from '@hypertrace/common';
import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { EnrichedAttribute } from '../../../../graphql/model/schema/enriched-attribute';
import { EnrichedAttributeSpecification } from '../../../../graphql/model/specifications/enriched-attribute-specification';
import { EnrichedAttributeSpecificationBuilder } from '../../../../graphql/request/builders/specification/attribute/enriched-attribute-specification-builder';
import { AttributeSpecificationModel } from './attribute-specification.model';

@Model({
  type: 'enriched-attribute-specification',
  displayName: 'Enriched Attribute'
})
export class EnrichedAttributeSpecificationModel extends AttributeSpecificationModel {
  @ModelProperty({
    key: 'units',
    displayName: 'Units',
    type: STRING_PROPERTY.type,
    required: false
  })
  public units: string = '';

  protected buildInnerSpec(): EnrichedAttributeSpecification {
    return new EnrichedAttributeSpecificationBuilder().build(this.attribute, this.units);
  }

  public extractFromServerData<T = unknown>(resultContainer: Dictionary<unknown>): EnrichedAttribute<T> {
    return this.innerSpec.extractFromServerData(resultContainer) as EnrichedAttribute<T>;
  }
}
