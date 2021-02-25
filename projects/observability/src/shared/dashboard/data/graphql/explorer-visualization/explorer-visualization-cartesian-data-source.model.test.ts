import { ColorService, TimeDuration, TimeUnit } from '@hypertrace/common';
import { createModelFactory } from '@hypertrace/dashboards/testing';
import {
  AttributeMetadataType,
  GraphQlQueryEventService,
  GraphQlTimeRange,
  MetadataService,
  MetricAggregationType
} from '@hypertrace/distributed-tracing';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { mockProvider } from '@ngneat/spectator/jest';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { CartesianSeriesVisualizationType } from '../../../../components/cartesian/chart';
import { ExploreVisualizationRequest } from '../../../../components/explore-query-editor/explore-visualization-builder';
import { ObservabilityTraceType } from '../../../../graphql/model/schema/observability-traces';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import {
  EXPLORE_GQL_REQUEST,
  GQL_EXPLORE_RESULT_INTERVAL_KEY,
  GraphQlExploreResponse
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import { CartesianResult } from '../../../widgets/charts/cartesian-widget/cartesian-widget.model';
import { ExplorerData } from '../explore/explore-cartesian-data-source.model';
import { ExplorerVisualizationCartesianDataSourceModel } from './explorer-visualization-cartesian-data-source.model';

describe('Explorer Visualization cartesian data source model', () => {
  const testInterval = new TimeDuration(5, TimeUnit.Minute);

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
  let model: ExplorerVisualizationCartesianDataSourceModel;

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

  const buildVisualizationRequest = (partialRequest: TestExplorePartial) => ({
    exploreQuery$: of({
      requestType: EXPLORE_GQL_REQUEST,
      context: ObservabilityTraceType.Api,
      limit: 1000,
      offset: 0,
      interval: partialRequest.interval as TimeDuration,
      groupBy: partialRequest.groupBy,
      selections: partialRequest.series.map(series => series.specification)
    } as const),
    resultsQuery$: EMPTY,
    series: partialRequest.series,
    groupBy: partialRequest.groupBy,
    interval: partialRequest.interval,
    context: ObservabilityTraceType.Api
  });

  beforeEach(() => {
    model = modelFactory(ExplorerVisualizationCartesianDataSourceModel, {
      api: {
        getTimeRange: jest.fn().mockReturnValue(new GraphQlTimeRange(2, 3))
      }
    }).model;
  });

  test('can build timeseries data', () => {
    model.request = buildVisualizationRequest({
      interval: 'AUTO',
      groupBy: undefined,
      series: [
        {
          specification: new ExploreSpecificationBuilder().exploreSpecificationForKey('foo', MetricAggregationType.Sum),
          visualizationOptions: {
            type: CartesianSeriesVisualizationType.Line
          }
        }
      ]
    });

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
                [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date(0)
              },
              {
                'sum(foo)': {
                  value: 15,
                  type: AttributeMetadataType.Number
                },
                [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date(1)
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
                  timestamp: new Date(0),
                  value: 10
                },
                {
                  timestamp: new Date(1),
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
    model.request = buildVisualizationRequest({
      interval: undefined,
      groupBy: {
        keys: ['baz']
      },
      series: [
        {
          specification: new ExploreSpecificationBuilder().exploreSpecificationForKey('foo', MetricAggregationType.Sum),
          visualizationOptions: {
            type: CartesianSeriesVisualizationType.Column
          }
        }
      ]
    });

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
    model.request = buildVisualizationRequest({
      interval: 'AUTO',
      groupBy: {
        keys: ['baz']
      },
      series: [
        {
          specification: new ExploreSpecificationBuilder().exploreSpecificationForKey('foo', MetricAggregationType.Sum),
          visualizationOptions: {
            type: CartesianSeriesVisualizationType.Area
          }
        }
      ]
    });

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
                [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date(0)
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
                [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date(1)
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
                [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date(0)
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
                [GQL_EXPLORE_RESULT_INTERVAL_KEY]: new Date(1)
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
                  timestamp: new Date(0),
                  value: 10
                },
                {
                  timestamp: new Date(1),
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
                  timestamp: new Date(0),
                  value: 20
                },
                {
                  timestamp: new Date(1),
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

interface TestExplorePartial extends Pick<ExploreVisualizationRequest, 'series' | 'groupBy' | 'interval'> {}
