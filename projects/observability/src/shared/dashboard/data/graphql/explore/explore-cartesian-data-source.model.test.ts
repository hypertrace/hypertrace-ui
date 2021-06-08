import { ColorService, FixedTimeRange, TimeDuration, TimeUnit } from '@hypertrace/common';
import { createModelFactory } from '@hypertrace/dashboards/testing';
import {
  AttributeMetadataType,
  GraphQlQueryEventService,
  MetadataService,
  MetricAggregationType
} from '@hypertrace/distributed-tracing';
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
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import {
  GQL_EXPLORE_RESULT_INTERVAL_KEY,
  GraphQlExploreResponse
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import { CartesianResult } from '../../../widgets/charts/cartesian-widget/cartesian-widget.model';
import { GraphQlGroupBy } from './../../../../graphql/model/schema/groupby/graphql-group-by';
import { ExploreCartesianDataSourceModel, ExplorerData } from './explore-cartesian-data-source.model';

describe('Explore cartesian data source model', () => {
  const testInterval = new TimeDuration(5, TimeUnit.Minute);
  const endTime = new Date('2021-05-11T00:35:00.000Z');
  const startTime = new Date(endTime.getTime() - 2 * testInterval.toMillis());

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
                [GQL_EXPLORE_RESULT_INTERVAL_KEY]: endTime
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
                  timestamp: new Date('2021-05-11T00:30:00.000Z'),
                  value: 0
                },
                {
                  timestamp: endTime,
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
                [GQL_EXPLORE_RESULT_INTERVAL_KEY]: endTime
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
                [GQL_EXPLORE_RESULT_INTERVAL_KEY]: endTime
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
              name: 'sum(foo): first',
              type: CartesianSeriesVisualizationType.Area,
              data: [
                {
                  timestamp: startTime,
                  value: 10
                },
                {
                  timestamp: new Date('2021-05-11T00:30:00.000Z'),
                  value: 0
                },
                {
                  timestamp: endTime,
                  value: 15
                }
              ]
            },
            {
              color: 'second color',
              name: 'sum(foo): second',
              type: CartesianSeriesVisualizationType.Area,
              data: [
                {
                  timestamp: startTime,
                  value: 20
                },
                {
                  timestamp: new Date('2021-05-11T00:30:00.000Z'),
                  value: 0
                },
                {
                  timestamp: endTime,
                  value: 25
                }
              ]
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
