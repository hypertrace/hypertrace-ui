import {
  Model,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { AttributeSpecificationModel, Specification } from '@hypertrace/observability';
import { Observable } from 'rxjs';
import { EntityType } from '../../../../../graphql/model/schema/entity';
import { EntitiesValuesDataSourceModel } from '../entities-values-data-source.model';

@Model({
  type: 'entities-attribute-data-source'
})
export class EntitiesAttributeDataSourceModel extends EntitiesValuesDataSourceModel {
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

  @ModelProperty({
    key: 'entity',
    type: STRING_PROPERTY.type,
    required: true
  })
  public entityType!: EntityType;

  public getData(): Observable<unknown[]> {
    return this.fetchSpecificationData();
  }
}
