import { Model, ModelModelPropertyTypeInstance, ModelProperty, ModelPropertyType } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { Specification } from '../../../../../graphql/model/schema/specifier/specification';
import { AttributeSpecificationModel } from '../../specifiers/attribute-specification.model';
import { EntityValueDataSourceModel } from '../entity-value-data-source.model';

@Model({
  type: 'entity-attribute-data-source'
})
export class EntityAttributeDataSourceModel extends EntityValueDataSourceModel<string | number> {
  @ModelProperty({
    key: 'attribute',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: AttributeSpecificationModel
    } as ModelModelPropertyTypeInstance,
    required: true
  })
  public specification!: Specification;

  public getData(): Observable<string | number> {
    return this.fetchSpecificationData();
  }
}
