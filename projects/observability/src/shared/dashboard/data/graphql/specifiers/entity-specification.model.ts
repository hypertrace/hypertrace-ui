import { Dictionary } from '@hypertrace/common';
import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { SpecificationModel } from '@hypertrace/observability';
import { Entity, EntityType } from '../../../../graphql/model/schema/entity';
import { EntitySpecification } from '../../../../graphql/model/schema/specifications/entity-specification';
import { ObservabilitySpecificationBuilder } from '../../../../graphql/request/builders/selections/observability-specification-builder';

@Model({
  type: 'entity-specification',
  displayName: 'Entity'
})
export class EntitySpecificationModel extends SpecificationModel<EntitySpecification> {
  @ModelProperty({
    key: 'id-attribute',
    displayName: 'ID Attribute',
    type: STRING_PROPERTY.type
  })
  public idAttribute: string = 'id';

  @ModelProperty({
    key: 'name-attribute',
    displayName: 'Name Attribute',
    type: STRING_PROPERTY.type
  })
  public nameAttribute: string = 'name';

  @ModelProperty({
    key: 'entity-type',
    type: STRING_PROPERTY.type
  })
  public entityType?: EntityType;

  protected buildInnerSpec(): EntitySpecification {
    return new ObservabilitySpecificationBuilder().buildEntitySpecification(
      this.idAttribute,
      this.nameAttribute,
      this.entityType
    );
  }

  public extractFromServerData(resultContainer: Dictionary<unknown>): Entity {
    return this.innerSpec.extractFromServerData(resultContainer);
  }
}
