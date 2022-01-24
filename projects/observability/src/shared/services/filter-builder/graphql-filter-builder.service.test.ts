import { FilterAttribute, FilterAttributeType, FilterOperator } from '@hypertrace/components';
import { createServiceFactory } from '@ngneat/spectator/jest';
import { GraphQlFieldFilter } from '../../graphql/model/schema/filter/field/graphql-field-filter';
import { GraphQlOperatorType } from '../../graphql/model/schema/filter/graphql-filter';
import { GraphQlFilterBuilderService } from './graphql-filter-builder.service';

describe('Graphql filter builder service', () => {
  const serviceFactory = createServiceFactory({ service: GraphQlFilterBuilderService });
  const buildFilter = (metadata: FilterAttribute, operator: FilterOperator, value: string | number) => ({
    metadata: metadata,
    field: metadata.name,
    operator: operator,
    value: value,
    userString: '',
    urlString: ''
  });
  // tslint:disable-next-line: no-object-literal-type-assertion
  const attribute1: FilterAttribute = {
    name: 'attr1',
    displayName: 'Attribute 1',
    type: FilterAttributeType.Number
  };

  // tslint:disable-next-line: no-object-literal-type-assertion
  const attribute2: FilterAttribute = {
    name: 'attr2',
    displayName: 'Attribute 2',
    type: FilterAttributeType.String
  };

  test('can build graphql filters', () => {
    const spectator = serviceFactory();

    expect(
      spectator.service.buildGraphQlFilters([
        buildFilter(attribute2, FilterOperator.Equals, 'foo'),
        buildFilter(attribute2, FilterOperator.NotEquals, 'bar'),
        buildFilter(attribute1, FilterOperator.GreaterThan, 5),
        buildFilter(attribute1, FilterOperator.GreaterThanOrEqualTo, 10),
        buildFilter(attribute1, FilterOperator.LessThan, 15),
        buildFilter(attribute1, FilterOperator.LessThanOrEqualTo, 20)
      ])
    ).toEqual([
      new GraphQlFieldFilter({ key: attribute2.name }, GraphQlOperatorType.Equals, 'foo'),
      new GraphQlFieldFilter({ key: attribute2.name }, GraphQlOperatorType.NotEquals, 'bar'),
      new GraphQlFieldFilter({ key: attribute1.name }, GraphQlOperatorType.GreaterThan, 5),
      new GraphQlFieldFilter({ key: attribute1.name }, GraphQlOperatorType.GreaterThanOrEqualTo, 10),
      new GraphQlFieldFilter({ key: attribute1.name }, GraphQlOperatorType.LessThan, 15),
      new GraphQlFieldFilter({ key: attribute1.name }, GraphQlOperatorType.LessThanOrEqualTo, 20)
    ]);
  });
});
