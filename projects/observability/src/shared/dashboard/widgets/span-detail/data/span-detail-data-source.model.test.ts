import { isEqualIgnoreFunctions } from '@hypertrace/common';
import { createModelFactory, SpectatorModel } from '@hypertrace/dashboards/testing';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { ModelApi } from '@hypertrace/hyperdash';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { spanIdKey } from '../../../../graphql/model/schema/span';
import { SpecificationBuilder } from '../../../../graphql/request/builders/specification/specification-builder';
import { SPAN_GQL_REQUEST } from '../../../../graphql/request/handlers/spans/span-graphql-query-handler.service';
import { SpanDetailDataSourceModel } from './span-detail-data-source.model';

describe('Span Detail data source model', () => {
  let spectator!: SpectatorModel<SpanDetailDataSourceModel>;
  const attributeSpecBuilder = new SpecificationBuilder();
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let lastEmittedQuery: unknown;

  const buildModel = createModelFactory({
    providers: [
      mockProvider(GraphQlRequestService, {
        query: jest.fn().mockReturnValue(
          of({
            [spanIdKey]: 'test-id',
            traceId: 'test-trace-id',
            statusCode: '200',
            spanTags: { param1: 'email' }
          })
        )
      })
    ]
  });

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };
    spectator = buildModel(SpanDetailDataSourceModel);

    spectator.model.span = {
      [spanIdKey]: 'test-id'
    };
    spectator.model.api = mockApi as ModelApi;
    spectator.model.query$.subscribe(query => (lastEmittedQuery = query.buildRequest([])));
  });

  test('builds expected request', () => {
    spectator.model.getData();
    expect(
      isEqualIgnoreFunctions(lastEmittedQuery, {
        requestType: SPAN_GQL_REQUEST,
        id: 'test-id',
        timestamp: undefined,
        properties: [
          attributeSpecBuilder.attributeSpecificationForKey('statusCode'),
          attributeSpecBuilder.attributeSpecificationForKey('spanTags'),
          attributeSpecBuilder.attributeSpecificationForKey('traceId')
        ]
      })
    ).toBe(true);
  });

  test('builds expected request with start time', () => {
    spectator.model.startTime = 1568907645141;
    spectator.model.getData();
    expect(
      isEqualIgnoreFunctions(lastEmittedQuery, {
        requestType: SPAN_GQL_REQUEST,
        id: 'test-id',
        timestamp: new Date(1568907645141),
        properties: [
          attributeSpecBuilder.attributeSpecificationForKey('statusCode'),
          attributeSpecBuilder.attributeSpecificationForKey('spanTags'),
          attributeSpecBuilder.attributeSpecificationForKey('traceId')
        ]
      })
    ).toBe(true);
  });

  test('builds expected request with start time from input span object', () => {
    spectator.model.span.startTime = 1568907645142;
    spectator.model.startTime = undefined;
    spectator.model.getData();
    expect(
      isEqualIgnoreFunctions(lastEmittedQuery, {
        requestType: SPAN_GQL_REQUEST,
        id: 'test-id',
        timestamp: new Date(1568907645142),
        properties: [
          attributeSpecBuilder.attributeSpecificationForKey('statusCode'),
          attributeSpecBuilder.attributeSpecificationForKey('spanTags'),
          attributeSpecBuilder.attributeSpecificationForKey('traceId')
        ]
      })
    ).toBe(true);
  });

  test('builds expected request when both start time property and from input span object is present', () => {
    spectator.model.span.startTime = 1568907645142;
    spectator.model.startTime = undefined;
    spectator.model.getData();
    expect(
      isEqualIgnoreFunctions(lastEmittedQuery, {
        requestType: SPAN_GQL_REQUEST,
        id: 'test-id',
        timestamp: new Date(1568907645142),
        properties: [
          attributeSpecBuilder.attributeSpecificationForKey('statusCode'),
          attributeSpecBuilder.attributeSpecificationForKey('spanTags'),
          attributeSpecBuilder.attributeSpecificationForKey('traceId')
        ]
      })
    ).toBe(true);
  });

  test('transforms raw data to SpanDetailData', () => {
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.model.getData()).toBe('(x|)', {
        x: expect.objectContaining({
          [spanIdKey]: 'test-id',
          traceId: 'test-trace-id',
          statusCode: '200',
          tags: { param1: 'email' }
        })
      });
    });
  });
});
