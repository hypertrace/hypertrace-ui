import {
  ARRAY_PROPERTY,
  Model,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  STRING_PROPERTY,
} from '@hypertrace/hyperdash';
import { GraphQlFilter } from '../../../../graphql/model/schema/filter/graphql-filter';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreSelectionSpecificationModel } from '../../../data/graphql/specifiers/explore-selection-specification.model';

@Model({
  type: 'top-n-explore-selection',
})
export class TopNExploreSelectionSpecificationModel {
  @ModelProperty({
    key: 'name-key',
    type: STRING_PROPERTY.type,
  })
  public nameKey: string = 'name';

  @ModelProperty({
    key: 'id-key',
    type: STRING_PROPERTY.type,
  })
  public idKey: string = 'id';

  @ModelProperty({
    key: 'context',
    type: STRING_PROPERTY.type,
    required: true,
  })
  public context!: string;

  @ModelProperty({
    key: 'filters',
    type: ARRAY_PROPERTY.type,
  })
  public filters: GraphQlFilter[] = [];

  @ModelProperty({
    key: 'metric',
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: ExploreSelectionSpecificationModel,
    } as ModelModelPropertyTypeInstance,
    required: true,
  })
  public metric!: ExploreSpecification;
}
