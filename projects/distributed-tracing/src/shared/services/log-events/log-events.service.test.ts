import { Dictionary } from '@hypertrace/common';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { Observable, of } from 'rxjs';
import { LogEvent } from '../../dashboard/widgets/waterfall/waterfall/waterfall-chart';
import { spanIdKey } from '../../graphql/model/schema/span';
import { Trace, traceIdKey, traceTypeKey } from '../../graphql/model/schema/trace';
import { LogEventsService } from './log-events.service';

describe('Log Events Service', () => {
  const mockTrace: Trace = {
    [traceIdKey]: 'test-id',
    [traceTypeKey]: 'API_TRACE',
    spans: []
  };

  const mockTraceWithLogEvents: Trace = {
    [traceIdKey]: 'test-id',
    [traceTypeKey]: 'TRACE',
    spans: [
      {
        [spanIdKey]: 'test-span',
        logEvents: {
          results: [
            {
              timestamp: 'time',
              attributes: undefined,
              summary: 'summary'
            }
          ]
        },
        serviceName: 'service',
        displaySpanName: 'span',
        protocolName: 'protocol',
        startTime: 1608151401295
      }
    ]
  };

  const createService = createServiceFactory({
    service: LogEventsService,
    providers: [
      mockProvider(GraphQlRequestService, {
        query: jest.fn().mockReturnValue(of({}))
      })
    ]
  });

  const expectSingleValueObservable = <T>(observable: Observable<T>, value: T): void => {
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(observable).toBe('(x|)', { x: value });
    });
  };

  test('should return empty array for zero log Events', () => {
    const spectator = createService();
    expect(spectator.service.getLogEventsWithSpanStartTime({ results: [] }, 1608151401295)).toMatchObject([]);
  });

  test('should return array with start time for log Events', () => {
    const spectator = createService();
    const logEvents: Dictionary<LogEvent[]> = {
      results: [
        {
          timestamp: 'time',
          attributes: {},
          summary: 'summary'
        }
      ]
    };
    const logEventsWithSpanStartTime = [
      {
        timestamp: 'time',
        attributes: {},
        summary: 'summary',
        spanStartTime: 1608151401295
      }
    ];
    expect(spectator.service.getLogEventsWithSpanStartTime(logEvents, 1608151401295)).toMatchObject(
      logEventsWithSpanStartTime
    );
  });

  test('should return trace and spans', () => {
    const spectator = createService({
      providers: [
        mockProvider(GraphQlRequestService, {
          query: jest.fn().mockReturnValue(of(mockTrace))
        })
      ]
    });
    expectSingleValueObservable(
      spectator.service.getLogEventsGqlResponseForTrace('test', '1608151401295', 'API_TRACE'),
      mockTrace
    );
  });

  test('should map log events', () => {
    const spectator = createService();
    const mappedLogEvents = [
      {
        timestamp: 'time',
        attributes: undefined,
        summary: 'summary',
        $$spanName: {
          serviceName: 'service',
          apiName: 'span',
          protocolName: 'protocol'
        },
        spanStartTime: 1608151401295
      }
    ];
    expect(spectator.service.mapLogEvents(mockTraceWithLogEvents)).toMatchObject(mappedLogEvents);
  });
});
