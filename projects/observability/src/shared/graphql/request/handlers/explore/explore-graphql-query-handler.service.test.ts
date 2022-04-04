import { FixedTimeRange, TimeDuration, TimeUnit } from '@hypertrace/common';
import { GraphQlEnumArgument } from '@hypertrace/graphql-client';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { MetadataService } from '../../../../services/metadata/metadata.service';
import { AttributeMetadataType } from '../../../model/metadata/attribute-metadata';
import { MetricAggregationType } from '../../../model/metrics/metric-aggregation';
import { ObservabilityEntityType } from '../../../model/schema/entity';
import { GraphQlFieldFilter } from '../../../model/schema/filter/field/graphql-field-filter';
import { GraphQlFilterType, GraphQlOperatorType } from '../../../model/schema/filter/graphql-filter';
import { GraphQlIntervalUnit } from '../../../model/schema/interval/graphql-interval-unit';
import { GraphQlMetricAggregationType } from '../../../model/schema/metrics/graphql-metric-aggregation-type';
import { ObservabilityTraceType } from '../../../model/schema/observability-traces';
import { GraphQlTimeRange } from '../../../model/schema/timerange/graphql-time-range';
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
              type: AttributeMetadataType.Long,
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
      keyExpressions: [{ key: 'serviceName' }]
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
              keyExpression: { key: 'duration' },
              operator: new GraphQlEnumArgument(GraphQlOperatorType.GreaterThan),
              value: 0,
              type: new GraphQlEnumArgument(GraphQlFilterType.Attribute)
            },
            {
              keyExpression: { key: 'duration' },
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
            expressions: [{ key: 'serviceName' }],
            groupLimit: 2
          }
        },
        {
          name: 'orderBy',
          value: [
            {
              direction: new GraphQlEnumArgument('ASC'),
              keyExpression: { key: 'duration' },
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
              arguments: [{ name: 'expression', value: { key: 'serviceName' } }],
              children: [{ path: 'value' }, { path: 'type' }]
            },
            {
              path: 'selection',
              alias: 'avg_duration',
              arguments: [
                { name: 'expression', value: { key: 'duration' } },
                { name: 'aggregation', value: new GraphQlEnumArgument(GraphQlMetricAggregationType.Average) }
              ],
              children: [{ path: 'value' }, { path: 'type' }]
            },
            {
              path: 'selection',
              alias: 'avgrate_min_duration',
              arguments: [
                { name: 'expression', value: { key: 'duration' } },
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
              keyExpression: { key: 'duration' },
              operator: new GraphQlEnumArgument(GraphQlOperatorType.GreaterThan),
              value: 0,
              type: new GraphQlEnumArgument(GraphQlFilterType.Attribute)
            },
            {
              keyExpression: { key: 'duration' },
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
            expressions: [{ key: 'serviceName' }],
            groupLimit: 2
          }
        },
        {
          name: 'orderBy',
          value: [
            {
              direction: new GraphQlEnumArgument('ASC'),
              keyExpression: { key: 'duration' },
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
              arguments: [{ name: 'expression', value: { key: 'serviceName' } }],
              children: [{ path: 'value' }, { path: 'type' }]
            },
            {
              path: 'selection',
              alias: 'avg_duration',
              arguments: [
                { name: 'expression', value: { key: 'duration' } },
                { name: 'aggregation', value: new GraphQlEnumArgument(GraphQlMetricAggregationType.Average) }
              ],
              children: [{ path: 'value' }, { path: 'type' }]
            },
            {
              path: 'selection',
              alias: 'avgrate_min_duration',
              arguments: [
                { name: 'expression', value: { key: 'duration' } },
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
            type: AttributeMetadataType.Long
          },
          avgrate_min_duration: {
            value: 55,
            type: AttributeMetadataType.Long
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
            type: AttributeMetadataType.Long
          },
          avgrate_min_duration: {
            value: 65,
            type: AttributeMetadataType.Long
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
            type: AttributeMetadataType.Long
          },
          avgrate_min_duration: {
            value: 70,
            type: AttributeMetadataType.Long
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
            type: AttributeMetadataType.Long
          },
          avgrate_min_duration: {
            value: 75,
            type: AttributeMetadataType.Long
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
            type: AttributeMetadataType.Long
          },
          avgrate_min_duration: {
            value: 80,
            type: AttributeMetadataType.Long
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
            type: AttributeMetadataType.Long
          },
          avgrate_min_duration: {
            value: 85,
            type: AttributeMetadataType.Long
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
            type: AttributeMetadataType.Long
          },
          'avgrate_min(duration)': {
            value: 55,
            type: AttributeMetadataType.Long
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
            type: AttributeMetadataType.Long
          },
          'avgrate_min(duration)': {
            value: 65,
            type: AttributeMetadataType.Long
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
            type: AttributeMetadataType.Long
          },
          'avgrate_min(duration)': {
            value: 70,
            type: AttributeMetadataType.Long
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
            type: AttributeMetadataType.Long
          },
          'avgrate_min(duration)': {
            value: 75,
            type: AttributeMetadataType.Long
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
            type: AttributeMetadataType.Long
          },
          'avgrate_min(duration)': {
            value: 80,
            type: AttributeMetadataType.Long
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
            type: AttributeMetadataType.Long
          },
          'avgrate_min(duration)': {
            value: 85,
            type: AttributeMetadataType.Long
          }
        }
      ],
      total: 6
    });
  });
});
