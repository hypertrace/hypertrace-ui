import { createServiceFactory } from '@ngneat/spectator/jest';
import { AttributeMetadataType } from '../../../graphql/model/metadata/attribute-metadata';
import { MetricAggregationType } from '../../../graphql/model/metrics/metric-aggregation';
import { GraphQlMetricAggregationType } from '../../../graphql/model/schema/metrics/graphql-metric-aggregation-type';
import { SPAN_SCOPE } from '../../../graphql/model/schema/span';
import {
  GraphQlMetadataRequest,
  MetadataGraphQlQueryHandlerService,
  METADATA_GQL_REQUEST
} from './metadata-graphql-query-handler.service';

describe('Metadata graphql query handler service', () => {
  const createService = createServiceFactory({
    service: MetadataGraphQlQueryHandlerService
  });

  const buildRequest = (): GraphQlMetadataRequest => ({
    requestType: METADATA_GQL_REQUEST
  });

  test('matches events request', () => {
    const spectator = createService();
    expect(spectator.service.matchesRequest(buildRequest())).toBe(true);
    expect(spectator.service.matchesRequest({ requestType: 'other' })).toBe(false);
  });

  test('produces expected graphql', () => {
    const spectator = createService();
    expect(spectator.service.convertRequest()).toEqual({
      path: 'metadata',
      children: [
        {
          path: 'name'
        },
        {
          path: 'displayName'
        },
        {
          path: 'type'
        },
        {
          path: 'scope'
        },
        {
          path: 'units'
        },
        {
          path: 'onlyAggregationsAllowed'
        },
        {
          path: 'supportedAggregations'
        },
        {
          path: 'groupable'
        }
      ]
    });
  });

  test('converts response to metadata array', () => {
    const spectator = createService();
    const serverResponse = [
      {
        name: 'first',
        scope: SPAN_SCOPE,
        displayName: 'First',
        units: 'ms',
        type: AttributeMetadataType.Number,
        onlyAggregationsAllowed: false,
        supportedAggregations: [
          GraphQlMetricAggregationType.Average,
          GraphQlMetricAggregationType.Min,
          GraphQlMetricAggregationType.Max,
          GraphQlMetricAggregationType.Sum,
          GraphQlMetricAggregationType.Avgrate,
          GraphQlMetricAggregationType.Count,
          GraphQlMetricAggregationType.Percentile
        ],
        groupable: false
      },
      {
        name: 'second',
        scope: SPAN_SCOPE,
        displayName: 'Second',
        units: 'ms',
        type: AttributeMetadataType.String,
        onlyAggregationsAllowed: false,
        supportedAggregations: [],
        groupable: true
      },
      {
        name: 'Third',
        scope: SPAN_SCOPE,
        displayName: 'Third',
        units: 'ms',
        type: AttributeMetadataType.StringMap,
        onlyAggregationsAllowed: false,
        supportedAggregations: [],
        groupable: false
      }
    ];

    expect(spectator.service.convertResponse(serverResponse)).toEqual([
      {
        name: 'first',
        scope: SPAN_SCOPE,
        displayName: 'First',
        units: 'ms',
        type: AttributeMetadataType.Number,
        requiresAggregation: false,
        allowedAggregations: [
          MetricAggregationType.Average,
          MetricAggregationType.Min,
          MetricAggregationType.Max,
          MetricAggregationType.Sum,
          MetricAggregationType.AvgrateMinute,
          MetricAggregationType.AvgrateSecond,
          MetricAggregationType.Count,
          MetricAggregationType.P99,
          MetricAggregationType.P95,
          MetricAggregationType.P90,
          MetricAggregationType.P50
        ],
        groupable: false
      },
      {
        name: 'second',
        scope: SPAN_SCOPE,
        displayName: 'Second',
        units: 'ms',
        type: AttributeMetadataType.String,
        requiresAggregation: false,
        allowedAggregations: [],
        groupable: true
      },
      {
        name: 'Third',
        scope: SPAN_SCOPE,
        displayName: 'Third',
        units: 'ms',
        type: AttributeMetadataType.StringMap,
        requiresAggregation: false,
        allowedAggregations: [],
        groupable: false
      }
    ]);
  });
});
