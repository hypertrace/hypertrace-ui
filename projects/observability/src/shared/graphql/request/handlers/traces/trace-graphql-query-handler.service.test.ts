import { FixedTimeRange, TimeDuration, TimeRangeService, TimeUnit } from '@hypertrace/common';
import { GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { GraphQlFilterType } from '../../../model/schema/filter/graphql-filter';
import { spanIdKey } from '../../../model/schema/span';
import { GraphQlTimeRange } from '../../../model/schema/timerange/graphql-time-range';
import { traceIdKey, traceTypeKey, TRACE_SCOPE } from '../../../model/schema/trace';
import { SpecificationBuilder } from '../../builders/specification/specification-builder';
import {
  GraphQlTraceRequest,
  TraceGraphQlQueryHandlerService,
  TRACE_GQL_REQUEST
} from './trace-graphql-query-handler.service';

describe('TraceGraphQlQueryHandlerService', () => {
  const createService = createServiceFactory({
    service: TraceGraphQlQueryHandlerService,
    providers: [
      mockProvider(TimeRangeService, {
        getCurrentTimeRange: jest
          .fn()
          .mockReturnValue(new FixedTimeRange(new Date(1568907645141), new Date(1568911245141)))
      })
    ]
  });

  const testTimeRange = GraphQlTimeRange.fromTimeRange(
    new FixedTimeRange(new Date(1568907645141), new Date(1568911245141))
  );
  const specBuilder = new SpecificationBuilder();
  const buildRequest = (timestamp?: Date): GraphQlTraceRequest => ({
    requestType: TRACE_GQL_REQUEST,
    traceId: 'test-id',
    timestamp: timestamp,
    traceProperties: [specBuilder.attributeSpecificationForKey('name')],
    spanLimit: 10,
    spanProperties: [specBuilder.attributeSpecificationForKey('name')]
  });

  test('matches trace request', () => {
    const spectator = createService();
    expect(spectator.service.matchesRequest(buildRequest())).toBe(true);
    expect(spectator.service.matchesRequest({ requestType: 'other' })).toBe(false);
  });

  test('produces expected graphql', () => {
    const spectator = createService();
    const requestMap = spectator.service.convertRequest(buildRequest());
    expect(requestMap.get('traces')).toEqual({
      path: 'traces',
      arguments: [
        {
          name: 'type',
          value: new GraphQlEnumArgument(TRACE_SCOPE)
        },
        {
          name: 'limit',
          value: 1
        },
        {
          name: 'between',
          value: {
            startTime: new Date(testTimeRange.from),
            endTime: new Date(testTimeRange.to)
          }
        },
        {
          name: 'filterBy',
          value: [
            {
              operator: new GraphQlEnumArgument('EQUALS'),
              value: 'test-id',
              type: new GraphQlEnumArgument(GraphQlFilterType.Id),
              idType: new GraphQlEnumArgument(TRACE_SCOPE)
            }
          ]
        }
      ],
      children: [
        {
          path: 'results',
          children: [
            { path: 'id' },
            { path: 'attribute', alias: 'name', arguments: [{ name: 'expression', value: { key: 'name' } }] }
          ]
        }
      ]
    });

    expect(requestMap.get('spans')).toEqual({
      path: 'spans',
      arguments: [
        {
          name: 'limit',
          value: 10
        },
        {
          name: 'between',
          value: {
            startTime: new Date(testTimeRange.from),
            endTime: new Date(testTimeRange.to)
          }
        },
        {
          name: 'filterBy',
          value: [
            {
              operator: new GraphQlEnumArgument('EQUALS'),
              value: 'test-id',
              type: new GraphQlEnumArgument(GraphQlFilterType.Id),
              idType: new GraphQlEnumArgument(TRACE_SCOPE)
            }
          ]
        }
      ],
      children: [
        {
          path: 'results',
          children: [
            { path: 'id' },
            { path: 'attribute', alias: 'name', arguments: [{ name: 'expression', value: { key: 'name' } }] }
          ]
        }
      ]
    });
  });

  test('produces expected graphql with timestamp', () => {
    const spectator = createService();
    const traceTimestamp = new Date(new TimeDuration(30, TimeUnit.Minute).toMillis());
    const requestMap = spectator.service.convertRequest(buildRequest(traceTimestamp));
    expect(requestMap.get('traces')).toEqual({
      path: 'traces',
      arguments: [
        {
          name: 'type',
          value: new GraphQlEnumArgument(TRACE_SCOPE)
        },
        {
          name: 'limit',
          value: 1
        },
        {
          name: 'between',
          value: {
            startTime: new Date(0),
            endTime: new Date(traceTimestamp.getTime() * 2)
          }
        },
        {
          name: 'filterBy',
          value: [
            {
              operator: new GraphQlEnumArgument('EQUALS'),
              value: 'test-id',
              type: new GraphQlEnumArgument(GraphQlFilterType.Id),
              idType: new GraphQlEnumArgument(TRACE_SCOPE)
            }
          ]
        }
      ],
      children: [
        {
          path: 'results',
          children: [
            { path: 'id' },
            { path: 'attribute', alias: 'name', arguments: [{ name: 'expression', value: { key: 'name' } }] }
          ]
        }
      ]
    });

    expect(requestMap.get('spans')).toEqual({
      path: 'spans',
      arguments: [
        {
          name: 'limit',
          value: 10
        },
        {
          name: 'between',
          value: {
            startTime: new Date(0),
            endTime: new Date(traceTimestamp.getTime() * 2)
          }
        },
        {
          name: 'filterBy',
          value: [
            {
              operator: new GraphQlEnumArgument('EQUALS'),
              value: 'test-id',
              type: new GraphQlEnumArgument(GraphQlFilterType.Id),
              idType: new GraphQlEnumArgument(TRACE_SCOPE)
            }
          ]
        }
      ],
      children: [
        {
          path: 'results',
          children: [
            { path: 'id' },
            { path: 'attribute', alias: 'name', arguments: [{ name: 'expression', value: { key: 'name' } }] }
          ]
        }
      ]
    });
  });

  test('omits spans query if no span properties requested', () => {
    const spectator = createService();
    const requestMap = spectator.service.convertRequest({ ...buildRequest(), spanProperties: undefined });
    expect(requestMap.get('spans')).toBeUndefined();
  });

  test('converts response to trace', () => {
    const spectator = createService();
    const serverTraceResponse = {
      results: [
        {
          id: 'first-trace-id',
          name: 'first-trace-name'
        }
      ]
    };

    const serverSpanResponse = {
      results: [
        {
          id: 'first-span-id',
          name: 'first-span-name'
        },
        {
          id: 'second-span-id',
          name: 'second-span-name'
        }
      ]
    };

    const serverResponseMap = new Map([
      ['traces', serverTraceResponse],
      ['spans', serverSpanResponse]
    ]);

    expect(spectator.service.convertResponse(serverResponseMap, buildRequest())).toEqual({
      [traceIdKey]: 'first-trace-id',
      [traceTypeKey]: TRACE_SCOPE,
      name: 'first-trace-name',
      spans: [
        {
          [spanIdKey]: 'first-span-id',
          name: 'first-span-name'
        },
        {
          [spanIdKey]: 'second-span-id',
          name: 'second-span-name'
        }
      ]
    });
  });

  test('omits spans on response if no span returned', () => {
    const spectator = createService();
    const serverTraceResponse = {
      results: [
        {
          id: 'first-trace-id',
          name: 'first-trace-name'
        }
      ]
    };
    const serverResponseMap = new Map([['traces', serverTraceResponse]]);

    expect(spectator.service.convertResponse(serverResponseMap, buildRequest())).toEqual({
      [traceIdKey]: 'first-trace-id',
      [traceTypeKey]: TRACE_SCOPE,
      name: 'first-trace-name'
    });
  });
});
