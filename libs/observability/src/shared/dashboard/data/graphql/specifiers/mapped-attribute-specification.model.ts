import { Dictionary } from '@hypertrace/common';
import { Model, ModelProperty, PLAIN_OBJECT_PROPERTY } from '@hypertrace/hyperdash';
import { AttributeSpecificationModel } from './attribute-specification.model';

@Model({
  type: 'mapped-attribute-specification',
  displayName: 'Mapped Attribute'
})
export class MappedAttributeSpecificationModel extends AttributeSpecificationModel {
  @ModelProperty({
    key: 'map',
    displayName: 'Map',
    type: PLAIN_OBJECT_PROPERTY.type,
    required: true
  })
  public map: Dictionary<unknown> = {};

  public extractFromServerData(resultContainer: Dictionary<unknown>): unknown {
    const returnedKey = super.extractFromServerData(resultContainer);

    return this.map[String(returnedKey)];
  }
}
