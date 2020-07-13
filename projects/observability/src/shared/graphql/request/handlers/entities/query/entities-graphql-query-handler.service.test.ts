import { fakeAsync } from '@angular/core/testing';
import { FixedTimeRange, TimeDuration, TimeUnit } from '@hypertrace/common';
import {
  AttributeMetadataType,
  GraphQlFieldFilter,
  GraphQlOperatorType,
  GraphQlTimeRange,
  MetadataService,
  MetricAggregationType,
  MetricHealth
} from '@hypertrace/distributed-tracing';
import { GraphQlEnumArgument, GraphQlRequestCacheability, GraphQlSelection } from '@hypertrace/graphql-client';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { ENTITY_METADATA } from '../../../../../../shared/constants/entity-metadata';
import { entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../../model/schema/entity';
import { GraphQlEntityFilter } from '../../../../model/schema/filter/entity/graphql-entity-filter';
import { GraphQlIntervalUnit } from '../../../../model/schema/interval/graphql-interval-unit';
import { ObservabilitySpecificationBuilder } from '../../../builders/selections/observability-specification-builder';
import {
  ENTITIES_GQL_REQUEST,
  EntitiesGraphQlQueryHandlerService,
  GraphQlEntitiesQueryRequest
} from './entities-graphql-query-handler.service';

describe('Entities graphql query handler', () => {
  const createService = createServiceFactory({
    service: EntitiesGraphQlQueryHandlerService,
    providers: [
      mockProvider(MetadataService, {
        getAttribute: (scope: string, attributeKey: string) =>
          of({
            name: attributeKey,
            displayName: 'My Attribute',
            units: 'My Units',
            type: AttributeMetadataType.String,
            scope: scope,
            requiresAggregation: false,
            allowedAggregations: []
          })
      }),
      {
        provide: ENTITY_METADATA,
        useValue: new Map([
          [ObservabilityEntityType.Api, {}],
          [ObservabilityEntityType.Service, { volatile: true }]
        ])
      }
    ]
  });

  const testTimeRange = GraphQlTimeRange.fromTimeRange(
    new FixedTimeRange(new Date(1568907645141), new Date(1568911245141))
  );
  const specBuilder = new ObservabilitySpecificationBuilder();
  const buildRequest = (
    entityType: ObservabilityEntityType = ObservabilityEntityType.Service,
    limit: number = 30
  ): GraphQlEntitiesQueryRequest => ({
    requestType: ENTITIES_GQL_REQUEST,
    entityType: entityType,
    timeRange: testTimeRange,
    properties: [specBuilder.attributeSpecificationForKey('name')],
    limit: limit,
    includeTotal: true
  });

  const buildRequestGraphqlSelection = (
    entityType: ObservabilityEntityType = ObservabilityEntityType.Service,
    limit: number = 30
  ): GraphQlSelection => ({
    path: 'entities',
    arguments: [
      { name: 'type', value: new GraphQlEnumArgument(entityType) },
      { name: 'limit', value: limit },
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
            path: 'attribute',
            alias: 'name',
            arguments: [{ name: 'key', value: 'name' }]
          }
        ]
      },
      { path: 'total' }
    ]
  });

  test('matches entities request', () => {
    const spectator = createService();
    expect(spectator.service.matchesRequest(buildRequest())).toBe(true);
    expect(spectator.service.matchesRequest({ requestType: 'other' })).toBe(false);
  });

  test('produces expected graphql', () => {
    const spectator = createService();
    expect(spectator.service.convertRequest(buildRequest())).toEqual(buildRequestGraphqlSelection());
  });

  test('does not add filter on discovery state for API Entity', () => {
    const spectator = createService();
    const apiEntityRequest = buildRequest(ObservabilityEntityType.Api, 1);
    apiEntityRequest.filters = [new GraphQlEntityFilter('test-id', ObservabilityEntityType.Api)];

    const graphqlSelection = buildRequestGraphqlSelection(ObservabilityEntityType.Api, 1);
    graphqlSelection.arguments!.push({
      name: 'filterBy',
      value: new GraphQlEntityFilter('test-id', ObservabilityEntityType.Api).asArgumentObjects()
    });

    expect(spectator.service.convertRequest(apiEntityRequest)).toEqual(graphqlSelection);
  });

  test('adds filter on discovery state for API Entities', () => {
    const spectator = createService();
    const graphqlSelection = buildRequestGraphqlSelection(ObservabilityEntityType.Api);
    graphqlSelection.arguments!.push({
      name: 'filterBy',
      value: new GraphQlFieldFilter('apiDiscoveryState', GraphQlOperatorType.Equals, 'DISCOVERED').asArgumentObjects()
    });

    expect(spectator.service.convertRequest(buildRequest(ObservabilityEntityType.Api))).toEqual(graphqlSelection);
  });
  test('converts response to entities array', fakeAsync(() => {
    const spectator = createService();
    const serverResponse = {
      results: [
        {
          id: '1',
          name: 'first'
        },
        {
          id: '2',
          name: 'second'
        }
      ],
      total: 2
    };

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.convertResponse(serverResponse, buildRequest())).toBe('(x|)', {
        x: {
          results: [
            {
              [entityIdKey]: '1',
              [entityTypeKey]: ObservabilityEntityType.Service,
              name: 'first'
            },
            {
              [entityIdKey]: '2',
              [entityTypeKey]: ObservabilityEntityType.Service,
              name: 'second'
            }
          ],
          total: 2
        }
      });
    });
  }));

  test('supports multiple different avgrate metrics in same query', () => {
    const spectator = createService();

    const requestWithAvgrates = {
      ...buildRequest(),
      properties: [
        specBuilder.metricAggregationSpecForKey('some_metric', MetricAggregationType.AvgrateMinute),
        specBuilder.metricAggregationSpecForKey('some_metric', MetricAggregationType.AvgrateSecond)
      ]
    };

    expect(spectator.service.convertRequest(requestWithAvgrates)).toEqual({
      path: 'entities',
      arguments: [
        { name: 'type', value: new GraphQlEnumArgument(ObservabilityEntityType.Service) },
        { name: 'limit', value: 30 },
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
              path: 'metric',
              alias: 'some_metric',
              arguments: [{ name: 'key', value: 'some_metric' }],
              children: [
                {
                  alias: 'avgrate_min',

                  path: 'avgrate',
                  arguments: [
                    { name: 'units', value: new GraphQlEnumArgument(GraphQlIntervalUnit.Minutes) },
                    { name: 'size', value: 1 }
                  ],
                  children: [{ path: 'value' }]
                }
              ]
            },
            {
              path: 'metric',
              alias: 'some_metric',
              arguments: [{ name: 'key', value: 'some_metric' }],
              children: [
                {
                  alias: 'avgrate_sec',
                  path: 'avgrate',
                  arguments: [
                    { name: 'units', value: new GraphQlEnumArgument(GraphQlIntervalUnit.Seconds) },
                    { name: 'size', value: 1 }
                  ],
                  children: [{ path: 'value' }]
                }
              ]
            }
          ]
        },
        { path: 'total' }
      ]
    });

    const serverResponse = {
      results: [
        {
          id: '1',
          some_metric: {
            avgrate_min: {
              value: 60
            },
            avgrate_sec: {
              value: 1
            }
          }
        }
      ],
      total: 1
    };

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.convertResponse(serverResponse, requestWithAvgrates)).toBe('(x|)', {
        x: {
          results: [
            {
              [entityIdKey]: '1',
              [entityTypeKey]: ObservabilityEntityType.Service,
              'avgrate_min(some_metric)': {
                value: 60,
                health: MetricHealth.NotSpecified,
                units: 'My Units/m'
              },
              'avgrate_sec(some_metric)': {
                value: 1,
                health: MetricHealth.NotSpecified,
                units: 'My Units/s'
              }
            }
          ],
          total: 1
        }
      });
    });
  });

  test('marks volatile entity queries non cacheable', () => {
    const spectator = createService();
    expect(spectator.service.getRequestOptions(buildRequest(ObservabilityEntityType.Service))).toEqual(
      expect.objectContaining({
        cacheability: GraphQlRequestCacheability.NotCacheable
      })
    );

    expect(spectator.service.getRequestOptions(buildRequest(ObservabilityEntityType.Api))).toEqual(
      expect.objectContaining({
        cacheability: GraphQlRequestCacheability.Cacheable
      })
    );
  });

  test('supports multiple timeseries with differing intervals or aggregations', () => {
    const spectator = createService();
    const firstDataPointTime = new Date(1570133543316);
    const secondDataPointTime = new Date(1570133843316);

    const requestWithAvgrates = {
      ...buildRequest(),
      properties: [
        specBuilder.metricTimeseriesSpec('a_metric', MetricAggregationType.Min, new TimeDuration(1, TimeUnit.Minute)),
        specBuilder.metricTimeseriesSpec('a_metric', MetricAggregationType.Max, new TimeDuration(1, TimeUnit.Minute)),
        specBuilder.metricTimeseriesSpec('a_metric', MetricAggregationType.Min, new TimeDuration(5, TimeUnit.Minute))
      ]
    };

    expect(spectator.service.convertRequest(requestWithAvgrates)).toEqual({
      path: 'entities',
      arguments: [
        { name: 'type', value: new GraphQlEnumArgument(ObservabilityEntityType.Service) },
        { name: 'limit', value: 30 },
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
              path: 'metric',
              alias: 'a_metric',
              arguments: [{ name: 'key', value: 'a_metric' }],
              children: [
                {
                  alias: 'min_series_1m',
                  path: 'series',
                  arguments: [
                    { name: 'size', value: 1 },
                    { name: 'units', value: new GraphQlEnumArgument(GraphQlIntervalUnit.Minutes) }
                  ],
                  children: [
                    { path: 'startTime' },
                    { path: 'min', arguments: [], alias: undefined, children: [{ path: 'value' }] }
                  ]
                }
              ]
            },
            {
              path: 'metric',
              alias: 'a_metric',
              arguments: [{ name: 'key', value: 'a_metric' }],
              children: [
                {
                  alias: 'max_series_1m',
                  path: 'series',
                  arguments: [
                    { name: 'size', value: 1 },
                    { name: 'units', value: new GraphQlEnumArgument(GraphQlIntervalUnit.Minutes) }
                  ],
                  children: [
                    { path: 'startTime' },
                    { path: 'max', arguments: [], alias: undefined, children: [{ path: 'value' }] }
                  ]
                }
              ]
            },

            {
              path: 'metric',
              alias: 'a_metric',
              arguments: [{ name: 'key', value: 'a_metric' }],
              children: [
                {
                  alias: 'min_series_5m',
                  path: 'series',
                  arguments: [
                    { name: 'size', value: 5 },
                    { name: 'units', value: new GraphQlEnumArgument(GraphQlIntervalUnit.Minutes) }
                  ],
                  children: [
                    { path: 'startTime' },
                    { path: 'min', arguments: [], alias: undefined, children: [{ path: 'value' }] }
                  ]
                }
              ]
            }
          ]
        },
        { path: 'total' }
      ]
    });

    const serverResponse = {
      results: [
        {
          id: '1',
          a_metric: {
            min_series_1m: [
              {
                min: {
                  value: 1
                },
                startTime: firstDataPointTime.toISOString()
              },
              {
                min: {
                  value: 2
                },
                startTime: secondDataPointTime.toISOString()
              }
            ],
            max_series_1m: [
              {
                max: {
                  value: 10
                },
                startTime: firstDataPointTime.toISOString()
              },
              {
                max: {
                  value: 20
                },
                startTime: secondDataPointTime.toISOString()
              }
            ],
            min_series_5m: [
              {
                min: {
                  value: 0
                },
                startTime: firstDataPointTime.toISOString()
              },
              {
                min: {
                  value: 1
                },
                startTime: secondDataPointTime.toISOString()
              }
            ]
          }
        }
      ],
      total: 1
    };

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.convertResponse(serverResponse, requestWithAvgrates)).toBe('(x|)', {
        x: {
          results: [
            {
              [entityIdKey]: '1',
              [entityTypeKey]: ObservabilityEntityType.Service,
              'min(a_metric,1m)': [
                { timestamp: firstDataPointTime, value: 1 },
                {
                  timestamp: secondDataPointTime,
                  value: 2
                }
              ],
              'max(a_metric,1m)': [
                { timestamp: firstDataPointTime, value: 10 },
                { timestamp: secondDataPointTime, value: 20 }
              ],
              'min(a_metric,5m)': [
                { timestamp: firstDataPointTime, value: 0 },
                {
                  timestamp: secondDataPointTime,
                  value: 1
                }
              ]
            }
          ],
          total: 1
        }
      });
    });
  });
});
