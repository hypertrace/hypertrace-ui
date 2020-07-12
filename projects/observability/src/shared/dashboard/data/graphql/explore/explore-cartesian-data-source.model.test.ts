import { ColorService } from '@hypertrace/common';
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
import { flatMap, take } from 'rxjs/operators';
import { CartesianSeriesVisualizationType, Series } from '../../../../components/cartesian/chart';
import { ExploreVisualizationRequest } from '../../../../components/explore-query-editor/explore-visualization-builder';
import { ObservabilityTraceType } from '../../../../graphql/model/schema/observability-traces';
import { ExploreSpecification } from '../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import {
  EXPLORE_GQL_REQUEST,
  GQL_EXPLORE_RESULT_GROUP_KEY,
  GQL_EXPLORE_RESULT_INTERVAL_KEY,
  GraphQlExploreResponse
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';
import { ExploreCartesianDataSourceModel, ExplorerData } from './explore-cartesian-data-source.model';

describe('Explore cartesian data source model', () => {
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
              requiresAggregation: false,
              allowedAggregations: [MetricAggregationType.Average]
            }
          ])
      })
    ]
  });
  let model: ExploreCartesianDataSourceModel;

  const getDataForQueryResponse = (response: GraphQlExploreResponse): Observable<Series<ExplorerData>[]> => {
    model.query$.pipe(take(1)).subscribe(query => {
      query.responseObserver.next(response);
      query.responseObserver.complete();
    });

    return model.getData().pipe(flatMap(fetcher => fetcher.getData()));
  };

  const buildVisualizationRequest = (partialRequest: TestExplorePartial) => ({
    exploreQuery$: of({
      requestType: EXPLORE_GQL_REQUEST,
      context: ObservabilityTraceType.Api,
      limit: 1000,
      offset: 0,
      interval: partialRequest.interval,
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
    model = modelFactory(ExploreCartesianDataSourceModel, {
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
        getDataForQueryResponse({
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
        })
      ).toBe('(x|)', {
        x: [
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
        ]
      });
    });
  });

  test('can build grouped series data', () => {
    model.request = buildVisualizationRequest({
      interval: undefined,
      groupBy: {
        key: 'baz'
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
        getDataForQueryResponse({
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
            }
          ]
        })
      ).toBe('(x|)', {
        x: [
          {
            color: 'first color',
            name: 'sum(foo)',
            type: CartesianSeriesVisualizationType.Column,
            data: [
              ['first', 10],
              ['second', 15]
            ]
          }
        ]
      });
    });
  });

  test('can build grouped timeseries data', () => {
    model.request = buildVisualizationRequest({
      interval: 'AUTO',
      groupBy: {
        key: 'baz'
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
        getDataForQueryResponse({
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
        })
      ).toBe('(x|)', {
        x: [
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
        ]
      });
    });
  });
});

interface TestExplorePartial extends Pick<ExploreVisualizationRequest, 'series' | 'groupBy' | 'interval'> {}
