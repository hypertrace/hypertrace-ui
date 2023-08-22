import { Dictionary } from '@hypertrace/common';
import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { GraphQlSortDirection } from '../../../../graphql/model/schema/sort/graphql-sort-direction';
import { Specification } from '../../../../graphql/model/schema/specifier/specification';
import { SpecificationBuilder } from '../../../../graphql/request/builders/specification/specification-builder';
import { SpecificationModel } from './specification.model';

@Model({
  type: 'attribute-sort-specification',
  displayName: 'Attribute Sort'
})
export class AttributeSortSpecificationModel extends SpecificationModel<Specification> {
  @ModelProperty({
    key: 'key',
    type: STRING_PROPERTY.type,
    required: true
  })
  public key!: string;

  @ModelProperty({
    key: 'direction',
    type: STRING_PROPERTY.type,
  })
  public direction!: GraphQlSortDirection;

  protected buildInnerSpec(): Specification {
    return new SpecificationBuilder().attributeSpecificationForKey(this.key);
  }

  public extractFromServerData(resultContainer: Dictionary<unknown>): unknown {
    return this.innerSpec.extractFromServerData(resultContainer);
  }
}
