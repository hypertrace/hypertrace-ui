import { ModelApi } from '@hypertrace/hyperdash';
import { ObservabilityEntityType } from '../../../../../graphql/model/schema/entity';
import { GraphQlEntityFilter } from '../../../../../graphql/model/schema/filter/entity/graphql-entity-filter';
import { GraphQlFilter } from '../../../../../graphql/model/schema/filter/graphql-filter';
import { GraphQlTimeRange } from '../../../../../graphql/model/schema/timerange/graphql-time-range';
import { SpecificationBuilder } from '../../../../../graphql/request/builders/specification/specification-builder';
import { ENTITY_GQL_REQUEST } from '../../../../../graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';
import { EntityAttributeDataSourceModel } from './entity-attribute-data-source.model';

describe('Metric attribute data source model', () => {
  const specBuilder = new SpecificationBuilder();
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model!: EntityAttributeDataSourceModel;
  let lastEmittedQueryBuilder: (filters: GraphQlFilter[]) => unknown;

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };
    model = new EntityAttributeDataSourceModel();
    model.specification = specBuilder.attributeSpecificationForKey('score');
    model.api = mockApi as ModelApi;
    model.query$.subscribe(query => (lastEmittedQueryBuilder = query.buildRequest));
    model.getData();
  });

  test('throws if no inherited entity filter', () => {
    expect(() => lastEmittedQueryBuilder([])).toThrow();
  });

  test('builds expected request', () => {
    model.getData();
    expect(lastEmittedQueryBuilder([new GraphQlEntityFilter('test', ObservabilityEntityType.Service)])).toEqual({
      requestType: ENTITY_GQL_REQUEST,
      properties: [model.specification],
      timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
      entityType: ObservabilityEntityType.Service,
      id: 'test'
    });
  });
});
