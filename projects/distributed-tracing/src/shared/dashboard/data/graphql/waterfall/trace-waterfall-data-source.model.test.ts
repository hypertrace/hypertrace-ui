import { createModelFactory } from '@hypertrace/dashboards/testing';
import { recordObservable, runFakeRxjs } from '@hypertrace/test-utils';
import { mockProvider } from '@ngneat/spectator/jest';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Trace, traceIdKey, traceTypeKey, TRACE_SCOPE } from '../../../../graphql/model/schema/trace';
import { MetadataService } from '../../../../services/metadata/metadata.service';
import { WaterfallData } from '../../../widgets/waterfall/waterfall/waterfall-chart';
import { GraphQlQueryEventService } from '../graphql-query-event.service';
import { spanIdKey, SpanType } from './../../../../graphql/model/schema/span';
import { TRACE_GQL_REQUEST } from './../../../../graphql/request/handlers/traces/trace-graphql-query-handler.service';
import { TraceWaterfallDataSourceModel } from './trace-waterfall-data-source.model';

describe('Trace Waterfall data source model', () => {
  const modelFactory = createModelFactory({
    providers: [
      mockProvider(MetadataService, {
        getAttribute: jest.fn().mockReturnValue(
          of({
            units: 'ms'
          })
        )
      }),
      mockProvider(GraphQlQueryEventService)
    ]
  });

  const mockTimeRange = {
    startTime: new Date(1),
    endTime: new Date(2)
  };

  const getDataForQueryResponse = (
    model: TraceWaterfallDataSourceModel,
    response: Trace
  ): Observable<WaterfallData[]> => {
    model.query$.pipe(take(1)).subscribe(query => {
      query.responseObserver.next(response);
      query.responseObserver.complete();
    });

    return model.getData();
  };

  test('should build expected query', () => {
    const spectator = modelFactory(TraceWaterfallDataSourceModel, {
      properties: {
        traceId: 'test-id',
        entrySpanId: 'span-id'
      },
      api: {
        getTimeRange: jest.fn().mockReturnValue(mockTimeRange)
      }
    });

    const receivedQueries = recordObservable(spectator.model.query$.pipe(map(query => query.buildRequest([]))));

    spectator.model.getData();

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(receivedQueries).toBe('x', {
        x: {
          requestType: TRACE_GQL_REQUEST,
          traceId: 'test-id',
          spanLimit: 1000,
          timestamp: undefined,
          traceProperties: [],
          spanProperties: [
            expect.objectContaining({
              name: 'displaySpanName'
            }),
            expect.objectContaining({
              name: 'duration'
            }),
            expect.objectContaining({
              name: 'endTime'
            }),
            expect.objectContaining({
              name: 'parentSpanId'
            }),
            expect.objectContaining({
              name: 'serviceName'
            }),
            expect.objectContaining({
              name: 'spanTags'
            }),
            expect.objectContaining({
              name: 'startTime'
            }),
            expect.objectContaining({
              name: 'type'
            }),
            expect.objectContaining({
              name: 'traceId'
            }),
            expect.objectContaining({
              name: 'errorCount'
            })
          ]
        }
      });
    });
  });
  test('should build expected query with startTime', () => {
    const spectator = modelFactory(TraceWaterfallDataSourceModel, {
      properties: {
        traceId: 'test-id',
        entrySpanId: 'span-id',
        startTime: 1576364117792
      },
      api: {
        getTimeRange: jest.fn().mockReturnValue(mockTimeRange)
      }
    });

    const receivedQueries = recordObservable(spectator.model.query$.pipe(map(query => query.buildRequest([]))));

    spectator.model.getData();

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(receivedQueries).toBe('x', {
        x: {
          requestType: TRACE_GQL_REQUEST,
          traceId: 'test-id',
          spanLimit: 1000,
          timestamp: new Date(1576364117792),
          traceProperties: [],
          spanProperties: [
            expect.objectContaining({
              name: 'displaySpanName'
            }),
            expect.objectContaining({
              name: 'duration'
            }),
            expect.objectContaining({
              name: 'endTime'
            }),
            expect.objectContaining({
              name: 'parentSpanId'
            }),
            expect.objectContaining({
              name: 'serviceName'
            }),
            expect.objectContaining({
              name: 'spanTags'
            }),
            expect.objectContaining({
              name: 'startTime'
            }),
            expect.objectContaining({
              name: 'type'
            }),
            expect.objectContaining({
              name: 'traceId'
            }),
            expect.objectContaining({
              name: 'errorCount'
            })
          ]
        }
      });
    });
  });

  test('should parse results', () => {
    const spectator = modelFactory(TraceWaterfallDataSourceModel, {
      properties: {
        traceId: 'test-id',
        entrySpanId: 'first-id'
      },
      api: {
        getTimeRange: jest.fn().mockReturnValue(mockTimeRange)
      }
    });

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(
        getDataForQueryResponse(spectator.model, {
          [traceIdKey]: 'test-id',
          [traceTypeKey]: TRACE_SCOPE,
          spans: [
            {
              [spanIdKey]: 'first-id',
              parentSpanId: '',
              startTime: 1571339873680,
              endTime: 1571339873680,
              duration: 1,
              displaySpanName: 'Span Name 1',
              serviceName: 'Service Name 1',
              type: SpanType.Entry,
              spanTags: {}
            },
            {
              [spanIdKey]: 'second-id',
              parentSpanId: 'first-id',
              startTime: 1571339873680,
              endTime: 1571339873680,
              duration: 2,
              displaySpanName: 'Span Name 2',
              serviceName: 'Service Name 2',
              type: SpanType.Exit,
              spanTags: {}
            }
          ]
        })
      ).toBe('(x|)', {
        x: [
          {
            id: 'first-id',
            isCurrentExecutionEntrySpan: true,
            parentId: '',
            startTime: 1571339873680,
            endTime: 1571339873680,
            duration: {
              value: 1,
              units: 'ms'
            },
            apiName: 'Span Name 1',
            serviceName: 'Service Name 1',
            protocolName: undefined,
            spanType: SpanType.Entry,
            tags: {}
          },
          {
            id: 'second-id',
            isCurrentExecutionEntrySpan: false,
            parentId: 'first-id',
            startTime: 1571339873680,
            endTime: 1571339873680,
            duration: {
              value: 2,
              units: 'ms'
            },
            apiName: 'Span Name 2',
            serviceName: 'Service Name 2',
            protocolName: undefined,
            spanType: SpanType.Exit,
            tags: {}
          }
        ]
      });
    });
  });
});
