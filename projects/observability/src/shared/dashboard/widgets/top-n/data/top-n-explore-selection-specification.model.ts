import { ExploreSelectionSpecificationModel } from '../../../data/graphql/specifiers/explore-selection-specification.model';
import {
  ARRAY_PROPERTY,
  Model,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { GraphQlFilter } from '@hypertrace/distributed-tracing';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';

@Model({
  type: 'top-n-explore-selection'
})
export class TopNExploreSelectionSpecificationModel {
  @ModelProperty({
    key: 'name-key',
    type: STRING_PROPERTY.type
  })
  public nameKey: string = 'name';

  @ModelProperty({
    key: 'id-key',
    type: STRING_PROPERTY.type
  })
  public idKey: string = 'id';

  @ModelProperty({
    key: 'context',
    type: STRING_PROPERTY.type,
    required: true
  })
  public context!: string;

  @ModelProperty({
    key: 'filters',
    type: ARRAY_PROPERTY.type
  })
  public filters: GraphQlFilter[] = [];

  @ModelProperty({
    key: 'metric',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: ExploreSelectionSpecificationModel
    } as ModelModelPropertyTypeInstance,
    required: true
  })
  public exploreSpec!: ExploreSpecification;
}
