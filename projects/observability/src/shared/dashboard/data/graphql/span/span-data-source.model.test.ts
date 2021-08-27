import { isEqualIgnoreFunctions } from '@hypertrace/common';
import { ModelApi } from '@hypertrace/hyperdash';
import { SpecificationBuilder } from '../../../../graphql/request/builders/specification/specification-builder';
import { SPAN_GQL_REQUEST } from '../../../../graphql/request/handlers/spans/span-graphql-query-handler.service';
import { SpanDataSourceModel } from './span-data-source.model';

describe('Span data source model', () => {
  const attributeSpecBuilder = new SpecificationBuilder();
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model!: SpanDataSourceModel;
  let lastEmittedQuery: unknown;

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };
    model = new SpanDataSourceModel();
    model.specifications = [attributeSpecBuilder.attributeSpecificationForKey('apiName')];
    model.api = mockApi as ModelApi;
    model.query$.subscribe(query => (lastEmittedQuery = query.buildRequest([])));
  });

  test('builds expected request', () => {
    model.spanId = 'test-id';
    model.getData();
    expect(
      isEqualIgnoreFunctions(lastEmittedQuery, {
        requestType: SPAN_GQL_REQUEST,
        id: 'test-id',
        timestamp: undefined,
        properties: [attributeSpecBuilder.attributeSpecificationForKey('apiName')]
      })
    ).toBe(true);
  });

  test('builds expected request with start time', () => {
    model.spanId = 'test-id';
    model.startTime = 1568907645141;
    model.getData();
    expect(
      isEqualIgnoreFunctions(lastEmittedQuery, {
        requestType: SPAN_GQL_REQUEST,
        id: 'test-id',
        timestamp: new Date(1568907645141),
        properties: [attributeSpecBuilder.attributeSpecificationForKey('apiName')]
      })
    ).toBe(true);
  });
});
