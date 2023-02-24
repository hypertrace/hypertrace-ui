import { Dictionary } from '@hypertrace/common';
import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { Specification } from '../../../../graphql/model/schema/specifier/specification';
import { SpecificationBuilder } from '../../../../graphql/request/builders/specification/specification-builder';
import { SpecificationModel } from './specification.model';

@Model({
  type: 'field-specification',
  displayName: 'Field'
})
export class FieldSpecificationModel extends SpecificationModel<Specification> {
  @ModelProperty({
    key: 'field',
    displayName: 'Field',
    type: STRING_PROPERTY.type,
    required: true
  })
  public field!: string;

  protected buildInnerSpec(): Specification {
    return new SpecificationBuilder().fieldSpecificationForKey(this.field);
  }

  public extractFromServerData(resultContainer: Dictionary<unknown>): unknown {
    return this.innerSpec.extractFromServerData(resultContainer);
  }
}
