import { FixedTimeRange, TimeDuration, TimeUnit } from '@hypertrace/common';
import {
  AttributeMetadataType,
  GraphQlFieldFilter,
  GraphQlFilterType,
  GraphQlMetricAggregationType,
  GraphQlOperatorType,
  GraphQlTimeRange,
  MetadataService,
  MetricAggregationType,
  SpecificationContextBuilder
} from '@hypertrace/distributed-tracing';
import { GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { GraphQlIntervalUnit } from '../../../model/schema/interval/graphql-interval-unit';
import { ObservabilityTraceType } from '../../../model/schema/observability-traces';
import { ExploreSpecificationBuilder } from '../../builders/specification/explore/explore-specification-builder';
import {
  EXPLORE_GQL_REQUEST,
  ExploreGraphQlQueryHandlerService,
  GQL_EXPLORE_RESULT_GROUP_KEY,
  GQL_EXPLORE_RESULT_INTERVAL_KEY,
  GraphQlExploreRequest
} from './explore-graphql-query-handler.service';

describe('Explore graphql query handler', () => {
  const testInterval = new TimeDuration(5, TimeUnit.Minute);

  const createService = createServiceFactory({
    service: ExploreGraphQlQueryHandlerService,
    providers: [
      mockProvider(SpecificationContextBuilder, {
        buildContext: jest.fn().mockReturnValue({
          getAutoInterval: () => testInterval
        })
      }),
      mockProvider(MetadataService, {
        getSelectionAttributes: () =>
          of([
            {
              name: 'duration',
              displayName: 'Duration',
              units: 'ms',
              type: AttributeMetadataType.Number,
              scope: 'API_TRACE',
              requiresAggregation: false,
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
    limit: 2,
    offset: 0,
    includeTotal: true,
    selections: [
      specBuilder.exploreSpecificationForKey('duration', MetricAggregationType.Average),
      specBuilder.exploreSpecificationForKey('duration', MetricAggregationType.AvgrateMinute)
    ],
    interval: new TimeDuration(1, TimeUnit.Minute),
    groupBy: {
      includeRest: true,
      key: 'serviceName'
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
        { name: 'limit', value: 2 },
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
            key: 'serviceName'
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
            { path: 'groupName', alias: '__group' },
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
          __group: 'First Service',
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
          __group: 'First Service',
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
          __group: 'Second Service',
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
          __group: 'Second Service',
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
          __group: '__remainder',
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
          __group: '__remainder',
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
          [GQL_EXPLORE_RESULT_GROUP_KEY]: 'First Service',
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
          [GQL_EXPLORE_RESULT_GROUP_KEY]: 'First Service',
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
          [GQL_EXPLORE_RESULT_GROUP_KEY]: 'Second Service',
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
          [GQL_EXPLORE_RESULT_GROUP_KEY]: 'Second Service',
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
          [GQL_EXPLORE_RESULT_GROUP_KEY]: '__remainder',
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
          [GQL_EXPLORE_RESULT_GROUP_KEY]: '__remainder',
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
