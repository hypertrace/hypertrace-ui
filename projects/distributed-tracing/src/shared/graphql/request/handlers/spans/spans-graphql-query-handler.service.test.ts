import { fakeAsync } from '@angular/core/testing';
import { FixedTimeRange } from '@hypertrace/common';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { MetadataService } from '../../../../services/metadata/metadata.service';
import { AttributeMetadataType } from '../../../model/metadata/attribute-metadata';
import { MetricAggregationType } from '../../../model/metrics/metric-aggregation';
import { spanIdKey } from '../../../model/schema/span';
import { GraphQlTimeRange } from '../../../model/schema/timerange/graphql-time-range';
import { SpecificationBuilder } from '../../builders/specification/specification-builder';
import {
  GraphQlSpansRequest,
  SpansGraphQlQueryHandlerService,
  SPANS_GQL_REQUEST
} from './spans-graphql-query-handler.service';

describe('SpansGraphQlQueryHandlerService', () => {
  const createService = createServiceFactory({
    service: SpansGraphQlQueryHandlerService,
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
                requiresAggregation: false,
                allowedAggregations: [MetricAggregationType.Average]
              });
            default:
              return of({
                name: attributeKey,
                displayName: 'API Name',
                units: '',
                type: AttributeMetadataType.Number,
                scope: scope,
                requiresAggregation: false,
                allowedAggregations: [MetricAggregationType.Average]
              });
          }
        }
      })
    ]
  });

  const testTimeRange = GraphQlTimeRange.fromTimeRange(
    new FixedTimeRange(new Date(1568907645141), new Date(1568911245141))
  );
  const specBuilder = new SpecificationBuilder();
  const buildRequest = (): GraphQlSpansRequest => ({
    requestType: SPANS_GQL_REQUEST,
    timeRange: testTimeRange,
    properties: [
      specBuilder.attributeSpecificationForKey('apiName'),
      specBuilder.attributeSpecificationForKey('duration')
    ],
    sort: {
      key: specBuilder.attributeSpecificationForKey('apiName'),
      direction: 'ASC'
    },
    limit: 2
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
          value: 2
        },
        {
          name: 'between',
          value: {
            startTime: new Date(testTimeRange.from),
            endTime: new Date(testTimeRange.to)
          }
        },
        {
          name: 'orderBy',
          value: [
            {
              direction: {
                value: 'ASC'
              },
              key: 'apiName'
            }
          ]
        }
      ],
      children: [
        {
          path: 'results',
          children: [
            { path: 'id' },
            {
              alias: 'apiName',
              arguments: [
                {
                  name: 'key',
                  value: 'apiName'
                }
              ],
              path: 'attribute'
            },
            {
              alias: 'duration',
              arguments: [
                {
                  name: 'key',
                  value: 'duration'
                }
              ],
              path: 'attribute'
            }
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
        },
        {
          id: 'test-id-2',
          apiName: 'second',
          duration: 2
        }
      ],
      total: 2
    };

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.convertResponse(serverResponse, buildRequest())).toBe('(x|)', {
        x: {
          results: [
            {
              [spanIdKey]: 'test-id-1',
              apiName: 'first',
              duration: {
                units: 'ms',
                value: 1
              }
            },
            {
              [spanIdKey]: 'test-id-2',
              apiName: 'second',
              duration: {
                units: 'ms',
                value: 2
              }
            }
          ],
          total: 2
        }
      });
    });
  }));
});
