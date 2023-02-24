import { Dictionary } from '@hypertrace/common';
import { ARRAY_PROPERTY, Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { Specification } from '../../../../../shared/graphql/model/schema/specifier/specification';
import { CompositeSpecification } from '../../../../../shared/graphql/model/specifications/composite-specification';
import { SpecificationBuilder } from '../../../../../shared/graphql/request/builders/specification/specification-builder';
import { SpecificationModel } from './specification.model';

@Model({
  type: 'composite-specification',
  displayName: 'Composite'
})
export class CompositeSpecificationModel extends SpecificationModel<CompositeSpecification> {
  @ModelProperty({
    key: 'specifications',
    displayName: 'Specifications',
    type: ARRAY_PROPERTY.type
  })
  public specifications: Specification[] = [];

  @ModelProperty({
    key: 'order-by',
    displayName: 'Order By',
    type: STRING_PROPERTY.type, // TODO make this its own property
    required: true
  })
  public orderByKey!: string;

  protected buildInnerSpec(): CompositeSpecification {
    return new SpecificationBuilder().buildCompositeSpecification(this.specifications, this.orderByKey);
  }

  public extractFromServerData(resultContainer: Dictionary<unknown>): unknown[] {
    return this.innerSpec.extractFromServerData(resultContainer);
  }
}
