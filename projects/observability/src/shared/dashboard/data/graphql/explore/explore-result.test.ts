import { AttributeMetadataType, MetricAggregationType } from '@hypertrace/distributed-tracing';
import {
  GQL_EXPLORE_RESULT_GROUP_KEY,
  GQL_EXPLORE_RESULT_INTERVAL_KEY
} from '../../../../../shared/graphql/request/handlers/explore/explore-graphql-query-handler.service';
import { ExploreResult } from './explore-result';

describe('Explore result', () => {
  test('can extract timeseries data', () => {
    const result = new ExploreResult({
      results: [
        {
          'sum(foo)': {
            value: 10,
            type: AttributeMetadataType.Number
          },
          [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date(0)
        },
        {
          'sum(foo)': {
            value: 15,
            type: AttributeMetadataType.Number
          },
          [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date(1)
        },
        {
          'sum(foo)': {
            value: 20,
            type: AttributeMetadataType.Number
          },
          [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date(2)
        }
      ]
    });

    expect(result.getTimeSeriesData('foo', MetricAggregationType.Sum)).toEqual([
      {
        timestamp: new Date(0),
        value: 10
      },
      {
        timestamp: new Date(1),
        value: 15
      },
      {
        timestamp: new Date(2),
        value: 20
      }
    ]);
  });

  test('can extract grouped series data', () => {
    const result = new ExploreResult({
      results: [
        {
          'sum(foo)': {
            value: 10,
            type: AttributeMetadataType.Number
          },
          [GQL_EXPLORE_RESULT_GROUP_KEY]: 'first'
        },
        {
          'sum(foo)': {
            value: 15,
            type: AttributeMetadataType.Number
          },
          [GQL_EXPLORE_RESULT_GROUP_KEY]: 'second'
        },
        {
          'sum(foo)': {
            value: 20,
            type: AttributeMetadataType.Number
          },
          [GQL_EXPLORE_RESULT_GROUP_KEY]: 'third'
        }
      ]
    });

    expect(result.getGroupedSeriesData('foo', MetricAggregationType.Sum)).toEqual([
      ['first', 10],
      ['second', 15],
      ['third', 20]
    ]);
  });

  test('renames other grouped series from server alias', () => {
    const result = new ExploreResult({
      results: [
        {
          'sum(foo)': {
            value: 10,
            type: AttributeMetadataType.Number
          },
          [GQL_EXPLORE_RESULT_GROUP_KEY]: 'first'
        },
        {
          'sum(foo)': {
            value: 15,
            type: AttributeMetadataType.Number
          },
          [GQL_EXPLORE_RESULT_GROUP_KEY]: '__Other'
        }
      ]
    });

    expect(result.getGroupedSeriesData('foo', MetricAggregationType.Sum)).toEqual([
      ['first', 10],
      ['Other results', 15]
    ]);
  });

  test('can extract timeseries data for group', () => {
    const result = new ExploreResult({
      results: [
        {
          'sum(foo)': {
            value: 10,
            type: AttributeMetadataType.Number
          },
          [GQL_EXPLORE_RESULT_GROUP_KEY]: 'first',
          [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date(0)
        },
        {
          'sum(foo)': {
            value: 15,
            type: AttributeMetadataType.Number
          },
          [GQL_EXPLORE_RESULT_GROUP_KEY]: 'first',
          [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date(1)
        },
        {
          'sum(foo)': {
            value: 20,
            type: AttributeMetadataType.Number
          },
          [GQL_EXPLORE_RESULT_GROUP_KEY]: 'second',
          [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date(0)
        },
        {
          'sum(foo)': {
            value: 25,
            type: AttributeMetadataType.Number
          },
          [GQL_EXPLORE_RESULT_GROUP_KEY]: 'second',
          [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date(1)
        }
      ]
    });

    expect(result.getGroupedTimeSeriesData('foo', MetricAggregationType.Sum)).toEqual(
      new Map([
        [
          'first',
          [
            {
              timestamp: new Date(0),
              value: 10
            },
            {
              timestamp: new Date(1),
              value: 15
            }
          ]
        ],
        [
          'second',
          [
            {
              timestamp: new Date(0),
              value: 20
            },
            {
              timestamp: new Date(1),
              value: 25
            }
          ]
        ]
      ])
    );
  });
});
