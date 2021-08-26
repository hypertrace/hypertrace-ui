import { createModelFactory } from '@hypertrace/dashboards/testing';
import {
  GraphQlQueryEventService,
  LogEventsService,
  MetadataService,
  spanIdKey,
  SpanType,
  Trace,
  traceIdKey,
  traceTypeKey,
  TRACE_GQL_REQUEST,
  WaterfallData
} from '@hypertrace/observability';
import { recordObservable, runFakeRxjs } from '@hypertrace/test-utils';
import { mockProvider } from '@ngneat/spectator/jest';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ObservabilityTraceType } from '../../../../graphql/model/schema/observability-traces';
import { ApiTraceWaterfallDataSourceModel } from './api-trace-waterfall-data-source.model';

describe('Api Trace Waterfall data source model', () => {
  const modelFactory = createModelFactory({
    providers: [
      mockProvider(MetadataService, {
        getAttribute: jest.fn().mockReturnValue(
          of({
            units: 'ms'
          })
        )
      }),
      mockProvider(GraphQlQueryEventService),
      mockProvider(LogEventsService, {
        getLogEventsWithSpanStartTime: jest.fn().mockReturnValue([])
      })
    ]
  });

  const mockTimeRange = {
    startTime: new Date(1),
    endTime: new Date(2)
  };

  const getDataForQueryResponse = (
    model: ApiTraceWaterfallDataSourceModel,
    response: Trace
  ): Observable<WaterfallData[]> => {
    model.query$.pipe(take(1)).subscribe(query => {
      query.responseObserver.next(response);
      query.responseObserver.complete();
    });

    return model.getData();
  };

  test('should build expected query', () => {
    const spectator = modelFactory(ApiTraceWaterfallDataSourceModel, {
      properties: {
        traceId: 'test-id'
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
          traceType: ObservabilityTraceType.Api,
          traceId: 'test-id',
          spanLimit: 1000,
          timestamp: undefined,
          traceProperties: [],
          spanProperties: [
            expect.objectContaining({
              name: 'displayEntityName'
            }),
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
              name: 'protocolName'
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
              name: 'errorCount'
            })
          ],
          logEventProperties: [
            expect.objectContaining({
              name: 'attributes'
            }),
            expect.objectContaining({
              name: 'timestamp'
            }),
            expect.objectContaining({
              name: 'summary'
            })
          ]
        }
      });
    });
  });

  test('should build expected query with start time', () => {
    const spectator = modelFactory(ApiTraceWaterfallDataSourceModel, {
      properties: {
        traceId: 'test-id',
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
          traceType: ObservabilityTraceType.Api,
          traceId: 'test-id',
          spanLimit: 1000,
          timestamp: new Date(1576364117792),
          traceProperties: [],
          spanProperties: [
            expect.objectContaining({
              name: 'displayEntityName'
            }),
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
              name: 'protocolName'
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
              name: 'errorCount'
            })
          ],
          logEventProperties: [
            expect.objectContaining({
              name: 'attributes'
            }),
            expect.objectContaining({
              name: 'timestamp'
            }),
            expect.objectContaining({
              name: 'summary'
            })
          ]
        }
      });
    });
  });

  test('should parse results', () => {
    const spectator = modelFactory(ApiTraceWaterfallDataSourceModel, {
      properties: {
        traceId: 'test-id'
      },
      api: {
        getTimeRange: jest.fn().mockReturnValue(mockTimeRange)
      }
    });

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(
        getDataForQueryResponse(spectator.model, {
          [traceIdKey]: 'first-id',
          [traceTypeKey]: ObservabilityTraceType.Api,
          spans: [
            {
              [spanIdKey]: 'first-id',
              parentSpanId: '',
              startTime: 1571339873680,
              endTime: 1571339873680,
              duration: 1,
              displayEntityName: 'Entity Name 1',
              displaySpanName: 'Span Name 1',
              protocolName: 'Protocol Name 1',
              type: SpanType.Entry,
              spanTags: {},
              logEvents: []
            },
            {
              [spanIdKey]: 'second-id',
              parentSpanId: 'first-id',
              startTime: 1571339873680,
              endTime: 1571339873680,
              duration: 2,
              displayEntityName: 'Entity Name 2',
              displaySpanName: 'Span Name 2',
              protocolName: 'Protocol Name 2',
              type: SpanType.Exit,
              spanTags: {},
              logEvents: []
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
            serviceName: 'Entity Name 1',
            apiName: 'Span Name 1',
            protocolName: 'Protocol Name 1',
            spanType: SpanType.Entry,
            tags: {},
            logEvents: []
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
            serviceName: 'Entity Name 2',
            apiName: 'Span Name 2',
            protocolName: 'Protocol Name 2',
            spanType: SpanType.Exit,
            tags: {},
            logEvents: []
          }
        ]
      });
    });
  });
});
