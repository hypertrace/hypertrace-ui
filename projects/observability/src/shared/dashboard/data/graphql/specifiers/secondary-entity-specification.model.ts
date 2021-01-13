import { Dictionary } from '@hypertrace/common';
import { SpecificationModel } from '@hypertrace/distributed-tracing';
import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { Entity, EntityType } from '../../../../graphql/model/schema/entity';
import { EntitySpecification } from '../../../../graphql/model/schema/specifications/entity-specification';
import { SecondaryEntitySpecificationBuilder } from '../../../../graphql/request/builders/specification/entity/secondary-entity-specification-builder';

@Model({
  type: 'secondary-entity-specification'
})
export class SecondaryEntitySpecificationModel extends SpecificationModel<EntitySpecification> {
  /*
   * A secondary entity is composed entirely of attributes on the primary entity. A second fetch is not made, so
   * the primary entity must provide the attributes to build the secondary entity.
   */
  @ModelProperty({
    key: 'idAttribute',
    displayName: 'ID Attribute',
    type: STRING_PROPERTY.type,
    required: true
  })
  public idAttribute!: string;

  @ModelProperty({
    key: 'nameAttribute',
    displayName: 'Name Attribute',
    type: STRING_PROPERTY.type,
    required: true
  })
  public nameAttribute!: string;

  @ModelProperty({
    key: 'entityType',
    type: STRING_PROPERTY.type,
    required: true
  })
  public entityType!: EntityType;

  protected buildInnerSpec(): EntitySpecification {
    return new SecondaryEntitySpecificationBuilder().build(this.idAttribute, this.nameAttribute, this.entityType);
  }

  public extractFromServerData(resultContainer: Dictionary<unknown>): Entity {
    return this.innerSpec.extractFromServerData(resultContainer);
  }
}
