import { fakeAsync } from '@angular/core/testing';
import { FixedTimeRange, TimeDuration, TimeRangeService, TimeUnit } from '@hypertrace/common';
import { GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { MetadataService } from '../../../../services/metadata/metadata.service';
import { AttributeMetadataType } from '../../../model/metadata/attribute-metadata';
import { MetricAggregationType } from '../../../model/metrics/metric-aggregation';
import { GraphQlFilterType } from '../../../model/schema/filter/graphql-filter';
import { spanIdKey } from '../../../model/schema/span';
import { GraphQlTimeRange } from '../../../model/schema/timerange/graphql-time-range';
import { SpecificationBuilder } from '../../builders/specification/specification-builder';
import {
  GraphQlSpanRequest,
  SpanGraphQlQueryHandlerService,
  SPAN_GQL_REQUEST
} from './span-graphql-query-handler.service';

describe('SpanGraphQlQueryHandlerService', () => {
  const createService = createServiceFactory({
    service: SpanGraphQlQueryHandlerService,
    providers: [
      mockProvider(MetadataService, {
        getAttribute: (scope: string, attributeKey: string) => {
          switch (attributeKey) {
            case 'duration':
              return of({
                name: attributeKey,
                displayName: 'Duration',
                units: 'ms',
                type: AttributeMetadataType.Number,
                scope: scope,
                onlySupportsAggregation: false,
                onlySupportsGrouping: false,
                allowedAggregations: [MetricAggregationType.Average]
              });
            default:
              return of({
                name: attributeKey,
                displayName: 'API Name',
                units: '',
                type: AttributeMetadataType.Number,
                scope: scope,
                onlySupportsAggregation: false,
                onlySupportsGrouping: false,
                allowedAggregations: [MetricAggregationType.Average]
              });
          }
        }
      }),
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

  const buildRequest = (timestamp?: Date): GraphQlSpanRequest => ({
    requestType: SPAN_GQL_REQUEST,
    id: 'test-id',
    timestamp: timestamp,
    properties: [
      specBuilder.attributeSpecificationForKey('apiName'),
      specBuilder.attributeSpecificationForKey('duration')
    ]
  });

  test('matches events request', () => {
    const spectator = createService();
    expect(spectator.service.matchesRequest(buildRequest())).toBe(true);
    expect(spectator.service.matchesRequest({ requestType: 'other' })).toBe(false);
  });

  test('produces expected graphql', () => {
    const spectator = createService();
    expect(spectator.service.convertRequest(buildRequest())).toEqual({
      path: 'spans',
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
              type: new GraphQlEnumArgument(GraphQlFilterType.Attribute),
              key: 'id'
            }
          ]
        }
      ],
      children: [
        {
          path: 'results',
          children: [
            { path: 'id' },
            { path: 'attribute', alias: 'apiName', arguments: [{ name: 'key', value: 'apiName' }] },
            { path: 'attribute', alias: 'duration', arguments: [{ name: 'key', value: 'duration' }] }
          ]
        },
        { path: 'total' }
      ]
    });
  });

  test('produces expected graphql with timestamp', () => {
    const timestamp = new Date(new TimeDuration(30, TimeUnit.Second).toMillis());

    const spectator = createService();
    expect(spectator.service.convertRequest(buildRequest(timestamp))).toEqual({
      path: 'spans',
      arguments: [
        {
          name: 'limit',
          value: 1
        },
        {
          name: 'between',
          value: {
            startTime: new Date(0),
            endTime: new Date(timestamp.getTime() * 2)
          }
        },
        {
          name: 'filterBy',
          value: [
            {
              operator: new GraphQlEnumArgument('EQUALS'),
              value: 'test-id',
              type: new GraphQlEnumArgument(GraphQlFilterType.Attribute),
              key: 'id'
            }
          ]
        }
      ],
      children: [
        {
          path: 'results',
          children: [
            { path: 'id' },
            { path: 'attribute', alias: 'apiName', arguments: [{ name: 'key', value: 'apiName' }] },
            { path: 'attribute', alias: 'duration', arguments: [{ name: 'key', value: 'duration' }] }
          ]
        },
        { path: 'total' }
      ]
    });
  });

  test('converts response to events array', fakeAsync(() => {
    const spectator = createService();
    const serverResponse = {
      results: [
        {
          id: 'test-id-1',
          apiName: 'first',
          duration: 1
        }
      ]
    };

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.convertResponse(serverResponse, buildRequest())).toBe('(x|)', {
        x: {
          [spanIdKey]: 'test-id-1',
          apiName: 'first',
          duration: {
            units: 'ms',
            value: 1
          }
        }
      });
    });
  }));
});
