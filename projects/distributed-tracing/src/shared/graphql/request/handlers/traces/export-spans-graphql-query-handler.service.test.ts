import { FixedTimeRange, TimeDuration, TimeRangeService, TimeUnit } from '@hypertrace/common';
import { GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { GraphQlFilterType } from '../../../model/schema/filter/graphql-filter';
import { GraphQlTimeRange } from '../../../model/schema/timerange/graphql-time-range';
import { TRACE_SCOPE } from '../../../model/schema/trace';
import {
  ExportSpansGraphQlQueryHandlerService,
  EXPORT_SPANS_GQL_REQUEST,
  GraphQlExportSpansRequest
} from './export-spans-graphql-query-handler.service';

describe('ExportSpansGraphQlQueryHandlerService', () => {
  const createService = createServiceFactory({
    service: ExportSpansGraphQlQueryHandlerService,
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
  const buildRequest = (timestamp?: Date): GraphQlExportSpansRequest => ({
    requestType: EXPORT_SPANS_GQL_REQUEST,
    traceId: 'test-id',
    timestamp: timestamp,
    limit: 1
  });

  test('matches request', () => {
    const spectator = createService();
    expect(spectator.service.matchesRequest(buildRequest())).toBe(true);
    expect(spectator.service.matchesRequest({ requestType: 'other' })).toBe(false);
  });

  test('produces expected graphql', () => {
    const spectator = createService();
    const expected = spectator.service.convertRequest(buildRequest());
    expect(expected).toEqual({
      path: 'exportSpans',
      arguments: [
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
          path: 'result'
        }
      ]
    });
  });

  test('produces expected graphql with timestamp', () => {
    const spectator = createService();
    const traceTimestamp = new Date(new TimeDuration(30, TimeUnit.Minute).toMillis());
    const expected = spectator.service.convertRequest(buildRequest(traceTimestamp));
    expect(expected).toEqual({
      path: 'exportSpans',
      arguments: [
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
          path: 'result'
        }
      ]
    });
  });

  test('converts response', () => {
    const spectator = createService();
    const exportSpansResponse = {
      result: '{}'
    };

    expect(spectator.service.convertResponse(exportSpansResponse)).toEqual('{}');
  });
});
