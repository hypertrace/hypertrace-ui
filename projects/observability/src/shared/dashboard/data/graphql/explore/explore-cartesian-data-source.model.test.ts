import { ColorService, FixedTimeRange, TimeDuration, TimeUnit } from '@hypertrace/common';
import { createModelFactory } from '@hypertrace/dashboards/testing';
import { Model } from '@hypertrace/hyperdash';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { mockProvider } from '@ngneat/spectator/jest';
import { Observable, of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { CartesianSeriesVisualizationType } from '../../../../components/cartesian/chart';
import {
  ExploreRequestState,
  ExploreSeries
} from '../../../../components/explore-query-editor/explore-visualization-builder';
import { AttributeMetadataType } from '../../../../graphql/model/metadata/attribute-metadata';
import { MetricAggregationType } from '../../../../graphql/model/metrics/metric-aggregation';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import {
  GQL_EXPLORE_RESULT_INTERVAL_KEY,
  GraphQlExploreResponse
} from '../../../../graphql/request/handlers/explore/explore-query';
import { MetadataService } from '../../../../services/metadata/metadata.service';
import { CartesianResult } from '../../../widgets/charts/cartesian-widget/cartesian-widget.model';
import { GraphQlQueryEventService } from '../graphql-query-event.service';
import { GraphQlGroupBy } from './../../../../graphql/model/schema/groupby/graphql-group-by';
import { ExploreCartesianDataSourceModel, ExplorerData } from './explore-cartesian-data-source.model';

describe('Explore cartesian data source model', () => {
  const testInterval = new TimeDuration(5, TimeUnit.Minute);
  const startTime = new Date('2021-05-11T00:20:00.000Z');
  const firstIntervalTime = new Date(startTime.getTime() + testInterval.toMillis());
  const secondIntervalTime = new Date(startTime.getTime() + 2 * testInterval.toMillis());
  const endTime = new Date(startTime.getTime() + 3 * testInterval.toMillis());

  const modelFactory = createModelFactory({
    providers: [
      mockProvider(GraphQlQueryEventService),
      mockProvider(ColorService, {
        getColorPalette: () => ({
          forNColors: () => ['first color', 'second color']
        })
      }),
      mockProvider(MetadataService, {
        getSpecificationDisplayName: (_: unknown, spec: ExploreSpecification) =>
          of(`${spec.aggregation}(${spec.name})`),
        getAttribute: (context: string, name: string) =>
          of([
            {
              name: name,
              displayName: 'Duration',
              units: 'ms',
              type: AttributeMetadataType.Number,
              scope: context,
              onlySupportsAggregation: false,
              onlySupportsGrouping: false,
              allowedAggregations: [MetricAggregationType.Average]
            }
          ])
      })
    ]
  });
  let model: TestExploreCartesianDataSourceModel;

  const getDataForQueryResponse = (
    response: GraphQlExploreResponse,
    requestInterval?: TimeDuration
  ): Observable<CartesianResult<ExplorerData>> => {
    model.query$.pipe(take(1)).subscribe(query => {
      query.responseObserver.next(response);
      query.responseObserver.complete();
    });

    return model.getData().pipe(mergeMap(fetcher => fetcher.getData(requestInterval)));
  };

  beforeEach(() => {
    model = modelFactory(TestExploreCartesianDataSourceModel, {
      api: {
        getTimeRange: () => new FixedTimeRange(startTime, endTime)
      }
    }).model;
  });

  test('can build timeseries data', () => {
    model.series = [
      {
        specification: new ExploreSpecificationBuilder().exploreSpecificationForKey('foo', MetricAggregationType.Sum),
        visualizationOptions: {
          type: CartesianSeriesVisualizationType.Line
        }
      }
    ];
    model.groupBy = undefined;

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(
        getDataForQueryResponse(
          {
            results: [
              {
                'sum(foo)': {
                  value: 10,
                  type: AttributeMetadataType.Number
                },
                [GQL_EXPLORE_RESULT_INTERVAL_KEY]: startTime
              },
              {
                'sum(foo)': {
                  value: 15,
                  type: AttributeMetadataType.Number
                },
                [GQL_EXPLORE_RESULT_INTERVAL_KEY]: secondIntervalTime
              }
            ]
          },
          testInterval
        )
      ).toBe('(x|)', {
        x: {
          series: [
            {
              color: 'first color',
              name: 'sum(foo)',
              type: CartesianSeriesVisualizationType.Line,
              data: [
                {
                  timestamp: startTime,
                  value: 10
                },
                {
                  timestamp: firstIntervalTime,
                  value: 0
                },
                {
                  timestamp: secondIntervalTime,
                  value: 15
                }
              ]
            }
          ],
          bands: []
        }
      });
    });
  });

  test('can build grouped series data', () => {
    model.series = [
      {
        specification: new ExploreSpecificationBuilder().exploreSpecificationForKey('foo', MetricAggregationType.Sum),
        visualizationOptions: {
          type: CartesianSeriesVisualizationType.Column
        }
      }
    ];

    model.groupBy = {
      keys: ['baz'],
      includeRest: true,
      limit: 5
    };

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(
        getDataForQueryResponse(
          {
            results: [
              {
                'sum(foo)': {
                  value: 10,
                  type: AttributeMetadataType.Number
                },
                baz: {
                  value: 'first',
                  type: AttributeMetadataType.String
                }
              },
              {
                'sum(foo)': {
                  value: 15,
                  type: AttributeMetadataType.Number
                },
                baz: {
                  value: 'second',
                  type: AttributeMetadataType.String
                }
              }
            ]
          },
          undefined
        )
      ).toBe('(x|)', {
        x: {
          series: [
            {
              color: 'first color',
              name: 'sum(foo)',
              type: CartesianSeriesVisualizationType.Column,
              data: [
                ['first', 10],
                ['second', 15]
              ]
            }
          ],
          bands: []
        }
      });
    });
  });

  test('can build grouped timeseries data', () => {
    model.series = [
      {
        specification: new ExploreSpecificationBuilder().exploreSpecificationForKey('foo', MetricAggregationType.Sum),
        visualizationOptions: {
          type: CartesianSeriesVisualizationType.Area
        }
      }
    ];

    model.groupBy = {
      keys: ['baz'],
      limit: 5
    };

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(
        getDataForQueryResponse(
          {
            results: [
              {
                'sum(foo)': {
                  value: 10,
                  type: AttributeMetadataType.Number
                },
                baz: {
                  value: 'first',
                  type: AttributeMetadataType.String
                },
                [GQL_EXPLORE_RESULT_INTERVAL_KEY]: startTime
              },
              {
                'sum(foo)': {
                  value: 15,
                  type: AttributeMetadataType.Number
                },
                baz: {
                  value: 'first',
                  type: AttributeMetadataType.String
                },
                [GQL_EXPLORE_RESULT_INTERVAL_KEY]: secondIntervalTime
              },
              {
                'sum(foo)': {
                  value: 20,
                  type: AttributeMetadataType.Number
                },
                baz: {
                  value: 'second',
                  type: AttributeMetadataType.String
                },
                [GQL_EXPLORE_RESULT_INTERVAL_KEY]: startTime
              },
              {
                'sum(foo)': {
                  value: 25,
                  type: AttributeMetadataType.Number
                },
                baz: {
                  value: 'second',
                  type: AttributeMetadataType.String
                },
                [GQL_EXPLORE_RESULT_INTERVAL_KEY]: secondIntervalTime
              }
            ]
          },
          testInterval
        )
      ).toBe('(x|)', {
        x: {
          series: [
            {
              color: 'first color',
              name: 'sum(foo)',
              type: CartesianSeriesVisualizationType.Area,
              data: [
                {
                  timestamp: startTime,
                  value: 10
                },
                {
                  timestamp: firstIntervalTime,
                  value: 0
                },
                {
                  timestamp: secondIntervalTime,
                  value: 15
                }
              ],
              assignedGroup: {
                id: 1,
                groupName: 'first'
              }
            },
            {
              color: 'second color',
              name: 'sum(foo)',
              type: CartesianSeriesVisualizationType.Area,
              data: [
                {
                  timestamp: startTime,
                  value: 20
                },
                {
                  timestamp: firstIntervalTime,
                  value: 0
                },
                {
                  timestamp: secondIntervalTime,
                  value: 25
                }
              ],
              assignedGroup: {
                id: 1,
                groupName: 'second'
              }
            }
          ],
          bands: []
        }
      });
    });
  });
});

@Model({
  type: 'test-explore-cartesian-data-source'
})
export class TestExploreCartesianDataSourceModel extends ExploreCartesianDataSourceModel {
  public series?: ExploreSeries[];
  public context?: string = 'context_scope';
  public groupBy?: GraphQlGroupBy;
  public resultLimit: number = 100;

  protected buildRequestState(interval?: TimeDuration | 'AUTO'): ExploreRequestState | undefined {
    if ((this.series ?? [])?.length === 0 || this.context === undefined) {
      return undefined;
    }

    return {
      series: this.series!,
      context: this.context,
      interval: interval,
      groupBy: this.groupBy,
      resultLimit: this.resultLimit
    };
  }
}
