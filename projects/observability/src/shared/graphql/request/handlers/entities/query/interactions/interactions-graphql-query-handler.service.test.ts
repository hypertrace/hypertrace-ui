import { fakeAsync } from '@angular/core/testing';
import { FixedTimeRange } from '@hypertrace/common';
import {
  AttributeMetadataType,
  GraphQlFilterType,
  GraphQlOperatorType,
  GraphQlTimeRange,
  MetadataService,
  MetricAggregationType,
  MetricHealth
} from '@hypertrace/distributed-tracing';
import { GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { ENTITY_METADATA } from '../../../../../../constants/entity-metadata';
import { entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../../../model/schema/entity';
import { ObservabilitySpecificationBuilder } from '../../../../builders/selections/observability-specification-builder';
import {
  GraphQlInteractionsRequest,
  InteractionsGraphQlQueryHandlerService,
  INTERACTIONS_GQL_REQUEST
} from './interactions-graphql-query-handler.service';

describe('Interactions graphql query handler', () => {
  const createService = createServiceFactory({
    service: InteractionsGraphQlQueryHandlerService,
    providers: [
      mockProvider(MetadataService, {
        getAttribute: (scope: string, attributeKey: string) =>
          of({
            name: attributeKey,
            displayName: 'Duration',
            units: 'ms',
            type: AttributeMetadataType.Number,
            scope: scope,
            requiresAggregation: false,
            allowedAggregations: [MetricAggregationType.Average]
          })
      }),
      {
        provide: ENTITY_METADATA,
        useValue: new Map()
      }
    ]
  });

  const testTimeRange = GraphQlTimeRange.fromTimeRange(
    new FixedTimeRange(new Date(1568907645141), new Date(1568911245141))
  );
  const specBuilder = new ObservabilitySpecificationBuilder();
  const buildRequest = (): GraphQlInteractionsRequest => ({
    requestType: INTERACTIONS_GQL_REQUEST,
    entityType: ObservabilityEntityType.Backend,
    entityId: 'test',
    neighborType: ObservabilityEntityType.Service,
    neighborSpecifications: [specBuilder.attributeSpecificationForKey('name')],
    interactionSpecifications: [specBuilder.metricAggregationSpecForKey('duration', MetricAggregationType.Average)],
    timeRange: testTimeRange
  });
  test('matches interactions request', () => {
    const spectator = createService();
    expect(spectator.service.matchesRequest(buildRequest())).toBe(true);
    expect(spectator.service.matchesRequest({ requestType: 'other' })).toBe(false);
  });

  test('produces expected graphql', () => {
    const spectator = createService();
    expect(spectator.service.convertRequest(buildRequest())).toEqual({
      path: 'entities',
      arguments: [
        { name: 'type', value: new GraphQlEnumArgument(ObservabilityEntityType.Backend) },
        { name: 'limit', value: 1 },
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
              operator: new GraphQlEnumArgument(GraphQlOperatorType.Equals),
              value: 'test',
              type: new GraphQlEnumArgument(GraphQlFilterType.Id),
              idType: new GraphQlEnumArgument(ObservabilityEntityType.Backend)
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
              path: 'incomingEdges',
              arguments: [{ name: 'neighborType', value: new GraphQlEnumArgument(ObservabilityEntityType.Service) }],
              children: [
                {
                  path: 'results',
                  children: [
                    {
                      path: 'metric',
                      alias: 'duration',
                      arguments: [{ name: 'key', value: 'duration' }],
                      children: [
                        {
                          path: 'avg',
                          alias: 'avg',
                          arguments: [],
                          children: [{ path: 'value' }]
                        }
                      ]
                    },
                    {
                      path: 'neighbor',
                      children: [
                        { path: 'id' },
                        { path: 'attribute', alias: 'name', arguments: [{ name: 'key', value: 'name' }] }
                      ]
                    }
                  ]
                },
                { path: 'total' }
              ]
            }
          ]
        }
      ]
    });
  });

  test('converts response to interaction array', fakeAsync(() => {
    const spectator = createService();
    const serverResponse = {
      results: [
        {
          id: 'test',
          incomingEdges: {
            results: [
              {
                duration: {
                  avg: {
                    value: 1
                  }
                },
                neighbor: {
                  id: '1',
                  name: 'first-neighbor'
                }
              },
              {
                duration: {
                  avg: {
                    value: 2
                  }
                },
                neighbor: {
                  id: '2',
                  name: 'second-neighbor'
                }
              }
            ],
            total: 2
          }
        }
      ]
    };

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.convertResponse(serverResponse, buildRequest())).toBe('(x|)', {
        x: {
          results: [
            {
              'avg(duration)': {
                value: 1,
                health: MetricHealth.NotSpecified,
                units: 'ms'
              },
              neighbor: {
                [entityIdKey]: '1',
                [entityTypeKey]: ObservabilityEntityType.Service,
                name: 'first-neighbor'
              }
            },
            {
              'avg(duration)': {
                value: 2,
                health: MetricHealth.NotSpecified,
                units: 'ms'
              },
              neighbor: {
                [entityIdKey]: '2',
                [entityTypeKey]: ObservabilityEntityType.Service,
                name: 'second-neighbor'
              }
            }
          ],
          total: 2
        }
      });
    });
  }));
});
