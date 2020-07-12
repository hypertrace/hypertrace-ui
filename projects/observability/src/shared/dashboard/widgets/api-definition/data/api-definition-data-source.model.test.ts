import { isEqualIgnoreFunctions } from '@hypertrace/common';
import { GraphQlTimeRange, SpecificationBuilder } from '@hypertrace/distributed-tracing';
import { ModelApi } from '@hypertrace/hyperdash';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../../../shared/graphql/model/schema/entity';
import { ENTITY_GQL_REQUEST } from '../../../../../shared/graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';
import { ApiDefinitionDataSourceModel } from './api-definition-data-source.model';

describe('API Definition data source model', () => {
  const attributeSpecBuilder = new SpecificationBuilder();
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model!: ApiDefinitionDataSourceModel;
  let lastEmittedQuery: unknown;

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };
    model = new ApiDefinitionDataSourceModel();
    model.apiId = 'test-id';
    model.api = mockApi as ModelApi;
    model.query$.subscribe(query => (lastEmittedQuery = query.buildRequest([])));
  });

  test('builds expected request', () => {
    model.getData();
    expect(
      isEqualIgnoreFunctions(lastEmittedQuery, {
        requestType: ENTITY_GQL_REQUEST,
        entityType: ObservabilityEntityType.Api,
        id: 'test-id',
        timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
        properties: [
          attributeSpecBuilder.attributeSpecificationForKey('httpUrl'),
          attributeSpecBuilder.attributeSpecificationForKey('pathParamsType'),
          attributeSpecBuilder.attributeSpecificationForKey('queryParamsType'),
          attributeSpecBuilder.attributeSpecificationForKey('queryParamsPii'),
          attributeSpecBuilder.attributeSpecificationForKey('pathParamsPii'),
          attributeSpecBuilder.attributeSpecificationForKey('requestBodySchema'),
          attributeSpecBuilder.attributeSpecificationForKey('responseBodySchema')
        ]
      })
    ).toBe(true);
  });

  test('transforms raw data to ApiDefinitionData', () => {
    const transformedData$ = model.mapResponseObject({
      [entityIdKey]: 'test-id',
      [entityTypeKey]: ObservabilityEntityType.Api,
      httpUrl: 'GET/loginservice/check',
      pathParamsType: { param1: 'value1' },
      queryParamsType: { param2: 'value2' },
      requestBodySchema: '{"content": 34}',
      responseBodySchema: '{"data": 56}',
      pathParamsPii: { param1: 'email' },
      queryParamsPii: { param2: 'id' }
    });

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(transformedData$).toBe('(x|)', {
        x: expect.objectContaining({
          id: 'test-id',
          params: [
            {
              name: 'param1',
              valueType: 'value1',
              parameterType: 'Path',
              pii: 'email'
            },
            {
              name: 'param2',
              valueType: 'value2',
              parameterType: 'Query',
              pii: 'id'
            }
          ],
          requestBodySchema: '{"content": 34}',
          responseBodySchema: '{"data": 56}',
          uri: 'GET/loginservice/check'
        })
      });
    });
  });
});
