import { FixedTimeRange, TimeDuration, TimeUnit } from '@hypertrace/common';
import { GraphQlEnumArgument } from '@hypertrace/graphql-client';
import {
  AttributeMetadataType,
  GraphQlFieldFilter,
  GraphQlFilterType,
  GraphQlMetricAggregationType,
  GraphQlOperatorType,
  GraphQlTimeRange,
  MetadataService,
  MetricAggregationType
} from '@hypertrace/observability';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { ObservabilityEntityType } from '../../../model/schema/entity';
import { GraphQlIntervalUnit } from '../../../model/schema/interval/graphql-interval-unit';
import { ObservabilityTraceType } from '../../../model/schema/observability-traces';
import { ExploreSpecificationBuilder } from '../../builders/specification/explore/explore-specification-builder';
import { ExploreGraphQlQueryHandlerService } from './explore-graphql-query-handler.service';
import { EXPLORE_GQL_REQUEST, GQL_EXPLORE_RESULT_INTERVAL_KEY, GraphQlExploreRequest } from './explore-query';

describe('Explore graphql query handler', () => {
  const createService = createServiceFactory({
    service: ExploreGraphQlQueryHandlerService,
    providers: [
      mockProvider(MetadataService, {
        getSelectionAttributes: () =>
          of([
            {
              name: 'duration',
              displayName: 'Duration',
              units: 'ms',
              type: AttributeMetadataType.Number,
              scope: 'API_TRACE',
              onlySupportsAggregation: false,
              onlySupportsGrouping: false,
              allowedAggregations: [MetricAggregationType.Average]
            }
          ])
      })
    ]
  });

  const testTimeRange = GraphQlTimeRange.fromTimeRange(
    new FixedTimeRange(new Date(1568907645141), new Date(1568911245141))
  );
  const specBuilder = new ExploreSpecificationBuilder();
  const buildRequest = (): GraphQlExploreRequest => ({
    requestType: EXPLORE_GQL_REQUEST,
    context: ObservabilityTraceType.Api,
    timeRange: testTimeRange,
    limit: 4,
    offset: 0,
    includeTotal: true,
    selections: [
      specBuilder.exploreSpecificationForKey('duration', MetricAggregationType.Average),
      specBuilder.exploreSpecificationForKey('duration', MetricAggregationType.AvgrateMinute)
    ],
    interval: new TimeDuration(1, TimeUnit.Minute),
    groupBy: {
      limit: 2,
      includeRest: true,
      keys: ['serviceName']
    },
    orderBy: [
      {
        direction: 'ASC',
        key: specBuilder.exploreSpecificationForKey('duration', MetricAggregationType.Average)
      }
    ],
    filters: [
      new GraphQlFieldFilter('duration', GraphQlOperatorType.GreaterThan, 0),
      new GraphQlFieldFilter('duration', GraphQlOperatorType.LessThan, 100)
    ]
  });

  test('matches explore request', () => {
    const spectator = createService();
    expect(spectator.service.matchesRequest(buildRequest())).toBe(true);
    expect(spectator.service.matchesRequest({ requestType: 'other' })).toBe(false);
  });

  test('produces expected graphql', () => {
    const spectator = createService();

    expect(spectator.service.convertRequest(buildRequest())).toEqual({
      path: 'explore',
      arguments: [
        { name: 'context', value: new GraphQlEnumArgument(ObservabilityTraceType.Api) },
        { name: 'limit', value: 4 },
        {
          name: 'between',
          value: {
            startTime: new Date(testTimeRange.from),
            endTime: new Date(testTimeRange.to)
          }
        },
        { name: 'offset', value: 0 },
        { name: 'interval', value: { size: 1, units: new GraphQlEnumArgument(GraphQlIntervalUnit.Minutes) } },
        {
          name: 'filterBy',
          value: [
            {
              key: 'duration',
              operator: new GraphQlEnumArgument(GraphQlOperatorType.GreaterThan),
              value: 0,
              type: new GraphQlEnumArgument(GraphQlFilterType.Attribute)
            },
            {
              key: 'duration',
              operator: new GraphQlEnumArgument(GraphQlOperatorType.LessThan),
              value: 100,
              type: new GraphQlEnumArgument(GraphQlFilterType.Attribute)
            }
          ]
        },
        {
          name: 'groupBy',
          value: {
            includeRest: true,
            keys: ['serviceName'],
            groupLimit: 2
          }
        },
        {
          name: 'orderBy',
          value: [
            {
              direction: new GraphQlEnumArgument('ASC'),
              key: 'duration',
              aggregation: new GraphQlEnumArgument(GraphQlMetricAggregationType.Average)
            }
          ]
        }
      ],
      children: [
        {
          path: 'results',
          children: [
            { path: 'intervalStart', alias: '__intervalStart' },
            {
              path: 'selection',
              alias: 'serviceName',
              arguments: [{ name: 'key', value: 'serviceName' }],
              children: [{ path: 'value' }, { path: 'type' }]
            },
            {
              path: 'selection',
              alias: 'avg_duration',
              arguments: [
                { name: 'key', value: 'duration' },
                { name: 'aggregation', value: new GraphQlEnumArgument(GraphQlMetricAggregationType.Average) }
              ],
              children: [{ path: 'value' }, { path: 'type' }]
            },
            {
              path: 'selection',
              alias: 'avgrate_min_duration',
              arguments: [
                { name: 'key', value: 'duration' },
                { name: 'aggregation', value: new GraphQlEnumArgument(GraphQlMetricAggregationType.Avgrate) },
                { name: 'units', value: new GraphQlEnumArgument(GraphQlIntervalUnit.Minutes) },
                { name: 'size', value: 1 }
              ],
              children: [{ path: 'value' }, { path: 'type' }]
            }
          ]
        },
        {
          path: 'total'
        }
      ]
    });
  });

  test('produces expected graphql for API context', () => {
    const spectator = createService();
    const request = buildRequest();
    request.context = ObservabilityEntityType.Api;

    expect(spectator.service.convertRequest(request)).toEqual({
      path: 'explore',
      arguments: [
        { name: 'context', value: new GraphQlEnumArgument(ObservabilityEntityType.Api) },
        { name: 'limit', value: 4 },
        {
          name: 'between',
          value: {
            startTime: new Date(testTimeRange.from),
            endTime: new Date(testTimeRange.to)
          }
        },
        { name: 'offset', value: 0 },
        { name: 'interval', value: { size: 1, units: new GraphQlEnumArgument(GraphQlIntervalUnit.Minutes) } },
        {
          name: 'filterBy',
          value: [
            {
              key: 'duration',
              operator: new GraphQlEnumArgument(GraphQlOperatorType.GreaterThan),
              value: 0,
              type: new GraphQlEnumArgument(GraphQlFilterType.Attribute)
            },
            {
              key: 'duration',
              operator: new GraphQlEnumArgument(GraphQlOperatorType.LessThan),
              value: 100,
              type: new GraphQlEnumArgument(GraphQlFilterType.Attribute)
            }
          ]
        },
        {
          name: 'groupBy',
          value: {
            includeRest: true,
            keys: ['serviceName'],
            groupLimit: 2
          }
        },
        {
          name: 'orderBy',
          value: [
            {
              direction: new GraphQlEnumArgument('ASC'),
              key: 'duration',
              aggregation: new GraphQlEnumArgument(GraphQlMetricAggregationType.Average)
            }
          ]
        }
      ],
      children: [
        {
          path: 'results',
          children: [
            { path: 'intervalStart', alias: '__intervalStart' },
            {
              path: 'selection',
              alias: 'serviceName',
              arguments: [{ name: 'key', value: 'serviceName' }],
              children: [{ path: 'value' }, { path: 'type' }]
            },
            {
              path: 'selection',
              alias: 'avg_duration',
              arguments: [
                { name: 'key', value: 'duration' },
                { name: 'aggregation', value: new GraphQlEnumArgument(GraphQlMetricAggregationType.Average) }
              ],
              children: [{ path: 'value' }, { path: 'type' }]
            },
            {
              path: 'selection',
              alias: 'avgrate_min_duration',
              arguments: [
                { name: 'key', value: 'duration' },
                { name: 'aggregation', value: new GraphQlEnumArgument(GraphQlMetricAggregationType.Avgrate) },
                { name: 'units', value: new GraphQlEnumArgument(GraphQlIntervalUnit.Minutes) },
                { name: 'size', value: 1 }
              ],
              children: [{ path: 'value' }, { path: 'type' }]
            }
          ]
        },
        {
          path: 'total'
        }
      ]
    });
  });

  test('converts response object', () => {
    const spectator = createService();
    const serverResponse = {
      results: [
        {
          __intervalStart: '2019-11-06T19:26:53.196Z',
          serviceName: {
            value: 'First Service',
            type: AttributeMetadataType.String
          },
          avg_duration: {
            value: 15,
            type: AttributeMetadataType.Number
          },
          avgrate_min_duration: {
            value: 55,
            type: AttributeMetadataType.Number
          }
        },
        {
          __intervalStart: '2019-11-06T19:27:53.196Z',
          serviceName: {
            value: 'First Service',
            type: AttributeMetadataType.String
          },
          avg_duration: {
            value: 20,
            type: AttributeMetadataType.Number
          },
          avgrate_min_duration: {
            value: 65,
            type: AttributeMetadataType.Number
          }
        },
        {
          __intervalStart: '2019-11-06T19:26:53.196Z',
          serviceName: {
            value: 'Second Service',
            type: AttributeMetadataType.String
          },
          avg_duration: {
            value: 25,
            type: AttributeMetadataType.Number
          },
          avgrate_min_duration: {
            value: 70,
            type: AttributeMetadataType.Number
          }
        },
        {
          __intervalStart: '2019-11-06T19:27:53.196Z',
          serviceName: {
            value: 'Second Service',
            type: AttributeMetadataType.String
          },
          avg_duration: {
            value: 30,
            type: AttributeMetadataType.Number
          },
          avgrate_min_duration: {
            value: 75,
            type: AttributeMetadataType.Number
          }
        },
        {
          __intervalStart: '2019-11-06T19:26:53.196Z',
          serviceName: {
            value: '__remainder',
            type: AttributeMetadataType.String
          },
          avg_duration: {
            value: 35,
            type: AttributeMetadataType.Number
          },
          avgrate_min_duration: {
            value: 80,
            type: AttributeMetadataType.Number
          }
        },
        {
          __intervalStart: '2019-11-06T19:27:53.196Z',
          serviceName: {
            value: '__remainder',
            type: AttributeMetadataType.String
          },
          avg_duration: {
            value: 40,
            type: AttributeMetadataType.Number
          },
          avgrate_min_duration: {
            value: 85,
            type: AttributeMetadataType.Number
          }
        }
      ],
      total: 6
    };

    expect(spectator.service.convertResponse(serverResponse, buildRequest())).toEqual({
      results: [
        {
          [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date('2019-11-06T19:26:53.196Z'),
          serviceName: {
            value: 'First Service',
            type: AttributeMetadataType.String
          },
          'avg(duration)': {
            value: 15,
            type: AttributeMetadataType.Number
          },
          'avgrate_min(duration)': {
            value: 55,
            type: AttributeMetadataType.Number
          }
        },
        {
          [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date('2019-11-06T19:27:53.196Z'),
          serviceName: {
            value: 'First Service',
            type: AttributeMetadataType.String
          },
          'avg(duration)': {
            value: 20,
            type: AttributeMetadataType.Number
          },
          'avgrate_min(duration)': {
            value: 65,
            type: AttributeMetadataType.Number
          }
        },
        {
          [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date('2019-11-06T19:26:53.196Z'),
          serviceName: {
            value: 'Second Service',
            type: AttributeMetadataType.String
          },
          'avg(duration)': {
            value: 25,
            type: AttributeMetadataType.Number
          },
          'avgrate_min(duration)': {
            value: 70,
            type: AttributeMetadataType.Number
          }
        },
        {
          [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date('2019-11-06T19:27:53.196Z'),
          serviceName: {
            value: 'Second Service',
            type: AttributeMetadataType.String
          },
          'avg(duration)': {
            value: 30,
            type: AttributeMetadataType.Number
          },
          'avgrate_min(duration)': {
            value: 75,
            type: AttributeMetadataType.Number
          }
        },
        {
          [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date('2019-11-06T19:26:53.196Z'),
          serviceName: {
            value: '__remainder',
            type: AttributeMetadataType.String
          },
          'avg(duration)': {
            value: 35,
            type: AttributeMetadataType.Number
          },
          'avgrate_min(duration)': {
            value: 80,
            type: AttributeMetadataType.Number
          }
        },
        {
          [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date('2019-11-06T19:27:53.196Z'),
          serviceName: {
            value: '__remainder',
            type: AttributeMetadataType.String
          },
          'avg(duration)': {
            value: 40,
            type: AttributeMetadataType.Number
          },
          'avgrate_min(duration)': {
            value: 85,
            type: AttributeMetadataType.Number
          }
        }
      ],
      total: 6
    });
  });
});
