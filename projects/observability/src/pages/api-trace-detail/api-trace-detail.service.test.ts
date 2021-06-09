import { ActivatedRoute } from '@angular/router';
import {
  DateFormatMode,
  DisplayDatePipe,
  RelativeTimeRange,
  TimeDuration,
  TimeRangeService,
  TimeUnit
} from '@hypertrace/common';
import {
  AttributeMetadataType,
  MetadataService,
  traceIdKey,
  traceTypeKey,
  TRACE_GQL_REQUEST
} from '@hypertrace/distributed-tracing';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { ObservabilityTraceType } from '../../shared/graphql/model/schema/observability-traces';
import { ApiTraceDetailService } from './api-trace-detail.service';

describe('Api TraceDetailService', () => {
  const createService = createServiceFactory({
    service: ApiTraceDetailService,
    providers: [
      mockProvider(ActivatedRoute, {
        paramMap: of({
          get: (key: string) => (key === 'id' ? 'test-id' : '1576364117792')
        })
      }),
      mockProvider(TimeRangeService, {
        getTimeRangeAndChanges: jest.fn().mockReturnValue(of(new RelativeTimeRange(new TimeDuration(1, TimeUnit.Hour))))
      }),
      mockProvider(GraphQlRequestService, {
        query: jest.fn().mockReturnValue(
          of({
            [traceTypeKey]: ObservabilityTraceType.Api,
            [traceIdKey]: 'test-id',
            traceId: 'trace-id',
            serviceName: 'test service',
            protocol: 'test protocol',
            apiName: 'test api name',
            startTime: 1576364117792,
            duration: 20
          })
        )
      }),
      mockProvider(MetadataService, {
        getAttribute: (scope: string, attributeKey: string) =>
          of({
            name: attributeKey,
            displayName: 'Duration',
            units: 'ms',
            type: AttributeMetadataType.Number,
            scope: scope,
            onlySupportsAggregation: false,
            onlySupportsGrouping: false,
            allowedAggregations: []
          })
      })
    ]
  });

  test('should map fetch and map trace details', () => {
    const spectator = createService();
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.fetchTraceDetails()).toBe('(x|)', {
        x: {
          id: 'test-id',
          startTime: 1576364117792,
          traceId: 'trace-id',
          timeString: `${new DisplayDatePipe().transform(1576364117792, {
            mode: DateFormatMode.DateAndTimeWithSeconds
          })} for 20 ms`,
          titleString: 'test service test protocol test api name',
          type: ObservabilityTraceType.Api
        }
      });
    });
  });

  test('should build correct query request with timestamp', () => {
    const spectator = createService();
    const graphqlService = spectator.inject(GraphQlRequestService);
    graphqlService.query.mockClear();

    spectator.service.fetchTraceDetails().subscribe();

    expect(spectator.inject(GraphQlRequestService).query).toHaveBeenCalledWith({
      requestType: TRACE_GQL_REQUEST,
      traceType: ObservabilityTraceType.Api,
      traceId: 'test-id',
      timestamp: new Date(1576364117792),
      traceProperties: [
        expect.objectContaining({
          name: 'serviceName'
        }),
        expect.objectContaining({
          name: 'protocol'
        }),
        expect.objectContaining({
          name: 'apiName'
        }),
        expect.objectContaining({
          name: 'startTime'
        }),
        expect.objectContaining({
          name: 'duration'
        }),
        expect.objectContaining({
          name: 'traceId'
        })
      ],
      spanProperties: [],
      spanLimit: 1
    });
  });

  test('should fetch and map logEvents', () => {
    const spectator = createService({
      providers: [
        mockProvider(ActivatedRoute, {
          paramMap: of({
            get: (key: string) => (key === 'id' ? 'test-id' : '1576364117792')
          })
        }),
        mockProvider(GraphQlRequestService, {
          query: jest.fn().mockReturnValue(
            of({
              spans: [
                {
                  logEvents: {
                    results: [
                      {
                        timestamp: 'time',
                        attributes: undefined,
                        summary: 'summary'
                      }
                    ]
                  },
                  displayEntityName: 'service',
                  displaySpanName: 'span',
                  protocolName: 'protocol',
                  startTime: 1608151401295
                }
              ]
            })
          )
        })
      ]
    });

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.fetchLogEvents()).toBe('(x|)', {
        x: [
          {
            timestamp: 'time',
            attributes: undefined,
            summary: 'summary',
            $$spanName: {
              serviceName: 'service',
              protocolName: 'protocol',
              apiName: 'span'
            },
            spanStartTime: 1608151401295
          }
        ]
      });
    });
  });
});
