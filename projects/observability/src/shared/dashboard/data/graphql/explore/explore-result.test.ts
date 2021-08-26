import { AttributeMetadataType, MetricAggregationType } from '@hypertrace/observability';
import { GQL_EXPLORE_RESULT_INTERVAL_KEY } from '../../../../graphql/request/handlers/explore/explore-query';
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
          group: {
            value: 'first',
            type: AttributeMetadataType.String
          }
        },
        {
          'sum(foo)': {
            value: 15,
            type: AttributeMetadataType.Number
          },
          group: {
            value: 'second',
            type: AttributeMetadataType.String
          }
        },
        {
          'sum(foo)': {
            value: 20,
            type: AttributeMetadataType.Number
          },
          group: {
            value: 'third',
            type: AttributeMetadataType.String
          }
        }
      ]
    });

    expect(result.getGroupedSeriesData(['group'], 'foo', MetricAggregationType.Sum)).toEqual([
      { keys: ['first'], value: 10 },
      { keys: ['second'], value: 15 },
      { keys: ['third'], value: 20 }
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
          group: {
            value: 'first',
            type: AttributeMetadataType.String
          }
        },
        {
          'sum(foo)': {
            value: 15,
            type: AttributeMetadataType.Number
          },
          group: {
            value: '__Other',
            type: AttributeMetadataType.String
          }
        }
      ]
    });

    expect(result.getGroupedSeriesData(['group'], 'foo', MetricAggregationType.Sum)).toEqual([
      { keys: ['first'], value: 10 },
      { keys: ['Others'], value: 15 }
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
          group: {
            value: 'first',
            type: AttributeMetadataType.String
          },
          [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date(0)
        },
        {
          'sum(foo)': {
            value: 15,
            type: AttributeMetadataType.Number
          },
          group: {
            value: 'first',
            type: AttributeMetadataType.String
          },
          [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date(1)
        },
        {
          'sum(foo)': {
            value: 20,
            type: AttributeMetadataType.Number
          },
          group: {
            value: 'second',
            type: AttributeMetadataType.String
          },
          [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date(0)
        },
        {
          'sum(foo)': {
            value: 25,
            type: AttributeMetadataType.Number
          },
          group: {
            value: 'second',
            type: AttributeMetadataType.String
          },
          [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date(1)
        }
      ]
    });

    expect(result.getGroupedTimeSeriesData(['group'], 'foo', MetricAggregationType.Sum)).toEqual(
      new Map([
        [
          ['first'],
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
          ['second'],
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
