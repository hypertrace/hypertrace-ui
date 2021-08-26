import { fakeAsync } from '@angular/core/testing';
import { FixedTimeRange } from '@hypertrace/common';
import { GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { MetadataService } from '../../../../services/metadata/metadata.service';
import { GraphQlTimeRange } from '../../../model/schema/timerange/graphql-time-range';
import { traceIdKey, traceTypeKey, TRACE_SCOPE } from '../../../model/schema/trace';
import { SpecificationBuilder } from '../../builders/specification/specification-builder';
import {
  GraphQlTracesRequest,
  TracesGraphQlQueryHandlerService,
  TRACES_GQL_REQUEST
} from './traces-graphql-query-handler.service';

describe('TracesGraphQlQueryHandlerService', () => {
  const createService = createServiceFactory({
    service: TracesGraphQlQueryHandlerService,
    providers: [
      mockProvider(MetadataService, {
        getAttribute: jest.fn().mockReturnValue(
          of({
            units: 'ms'
          })
        )
      })
    ]
  });

  const testTimeRange = GraphQlTimeRange.fromTimeRange(
    new FixedTimeRange(new Date(1568907645141), new Date(1568911245141))
  );
  const specBuilder = new SpecificationBuilder();
  const buildAttributeRequest = (): GraphQlTracesRequest => ({
    requestType: TRACES_GQL_REQUEST,
    timeRange: testTimeRange,
    properties: [specBuilder.attributeSpecificationForKey('name')],
    limit: 10
  });

  test('matches traces request', () => {
    const spectator = createService();
    expect(spectator.service.matchesRequest(buildAttributeRequest())).toBe(true);
    expect(spectator.service.matchesRequest({ requestType: 'other' })).toBe(false);
  });

  test('produces expected graphql', () => {
    const spectator = createService();
    expect(spectator.service.convertRequest(buildAttributeRequest())).toEqual({
      path: 'traces',
      arguments: [
        {
          name: 'type',
          value: new GraphQlEnumArgument(TRACE_SCOPE)
        },
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
        }
      ],
      children: [
        {
          path: 'results',
          children: [
            { path: 'id' },
            {
              alias: 'name',
              path: 'attribute',
              arguments: [
                {
                  name: 'key',
                  value: 'name'
                }
              ]
            }
          ]
        },
        {
          path: 'total'
        }
      ]
    });
  });

  test('converts response to traces', fakeAsync(() => {
    const spectator = createService();
    const serverTracesResponse = {
      results: [
        {
          id: 'first-trace-id',
          name: 'first-trace-name'
        }
      ],
      total: 1
    };

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.convertResponse(serverTracesResponse, buildAttributeRequest())).toBe('(x|)', {
        x: {
          results: [
            {
              [traceIdKey]: 'first-trace-id',
              [traceTypeKey]: TRACE_SCOPE,
              name: {
                units: 'ms',
                value: 'first-trace-name'
              }
            }
          ],
          total: 1
        }
      });
    });
  }));
});
