import { ENUM_TYPE, EnumPropertyTypeInstance } from '@hypertrace/dashboards';
import { Model, ModelProperty } from '@hypertrace/hyperdash';
import { ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import { DefinesNeighbor, NeighborDirection } from '../../../../graphql/model/schema/neighbor';
import { EntitySpecificationModel } from './entity-specification.model';

@Model({
  type: 'neighbor-entity-specification',
  displayName: 'Neighbor entity'
})
export class NeighborEntitySpecificationModel extends EntitySpecificationModel implements DefinesNeighbor {
  @ModelProperty({
    key: 'neighbor-direction',
    displayName: 'Neighbor Direction',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [NeighborDirection.Upstream, NeighborDirection.Downstream]
    } as EnumPropertyTypeInstance,
    required: true
  })
  public neighborDirection!: NeighborDirection;

  @ModelProperty({
    key: 'neighbor-type',
    displayName: 'Neighbor Entity Type',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [ObservabilityEntityType.Service, ObservabilityEntityType.Api, ObservabilityEntityType.Backend]
    } as EnumPropertyTypeInstance,
    required: true
  })
  public neighborType!: ObservabilityEntityType;
}
