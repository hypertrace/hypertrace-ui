import { ModelApi } from '@hypertrace/hyperdash';
import { spanIdKey } from '../../../../graphql/model/schema/span';
import { traceIdKey, traceTypeKey, TRACE_SCOPE } from '../../../../graphql/model/schema/trace';
import {
  TraceGraphQlQueryHandlerService,
  TRACE_GQL_REQUEST
} from '../../../../graphql/request/handlers/traces/trace-graphql-query-handler.service';
import { ObservedGraphQlRequest } from '../../../data/graphql/graphql-query-event.service';
import { ApiTraceDetailDataSourceModel } from './api-trace-detail-data-source.model';

describe('API Trace detail data source model', () => {
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model!: ApiTraceDetailDataSourceModel;
  let emittedQueries: unknown;

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };
    model = new ApiTraceDetailDataSourceModel();
    model.trace = {
      [traceIdKey]: 'test',
      [traceTypeKey]: TRACE_SCOPE
    };
    model.api = mockApi as ModelApi;
    model.query$.subscribe((query: ObservedGraphQlRequest<TraceGraphQlQueryHandlerService>) => {
      const request = query.buildRequest([]);
      emittedQueries = request;

      if (request.requestType === TRACE_GQL_REQUEST && request.traceType === TRACE_SCOPE) {
        const responseObserver = query.responseObserver;
        responseObserver.next({
          test: 'test',
          [traceIdKey]: 'test',
          [traceTypeKey]: TRACE_SCOPE,
          statusCode: '200',
          tags: {},
          requestUrl: 'test-url',
          spans: [
            {
              test: 'test',
              [spanIdKey]: 'test'
            }
          ]
        });

        responseObserver.complete();
      } else {
        const responseObserver = query.responseObserver;
        responseObserver.next({
          test: 'test',
          [traceIdKey]: 'test',
          [traceTypeKey]: TRACE_SCOPE,
          statusCode: '200',
          tags: {},
          spans: [
            {
              test: 'test',
              [spanIdKey]: 'test'
            }
          ]
        });

        responseObserver.complete();
      }
    });
  });

  test('builds expected request', () => {
    const data$ = model.getData();
    data$.subscribe();

    expect(emittedQueries).toEqual(
      expect.objectContaining({
        requestType: TRACE_GQL_REQUEST,
        traceId: 'test',
        spanLimit: 0,
        timestamp: undefined,
        traceProperties: expect.arrayContaining([
          expect.objectContaining({ name: 'tags' }),
          expect.objectContaining({ name: 'statusCode' }),
          expect.not.objectContaining({ name: 'traceId' })
        ])
      })
    );
  });

  test('builds expected request with start time', () => {
    model.startTime = 1576364117792;
    const data$ = model.getData();
    data$.subscribe();

    expect(emittedQueries).toEqual(
      expect.objectContaining({
        requestType: TRACE_GQL_REQUEST,
        traceId: 'test',
        spanLimit: 0,
        timestamp: new Date(1576364117792),
        traceProperties: expect.arrayContaining([
          expect.objectContaining({ name: 'tags' }),
          expect.objectContaining({ name: 'statusCode' }),
          expect.not.objectContaining({ name: 'traceId' })
        ])
      })
    );
  });
});
