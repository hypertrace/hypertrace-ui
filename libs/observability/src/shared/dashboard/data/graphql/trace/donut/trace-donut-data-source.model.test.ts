import { createModelFactory } from '@hypertrace/dashboards/testing';
import { recordObservable, runFakeRxjs } from '@hypertrace/test-utils';
import { mockProvider } from '@ngneat/spectator/jest';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { DonutSeriesResults } from '../../../../../components/donut/donut';
import { AttributeMetadataType } from '../../../../../graphql/model/metadata/attribute-metadata';
import { MetricAggregationType } from '../../../../../graphql/model/metrics/metric-aggregation';
import { ObservabilityTraceType } from '../../../../../graphql/model/schema/observability-traces';
import { GraphQlTimeRange } from '../../../../../graphql/model/schema/timerange/graphql-time-range';
import { ObservabilitySpecificationBuilder } from '../../../../../graphql/request/builders/selections/observability-specification-builder';
import {
  EXPLORE_GQL_REQUEST,
  GraphQlExploreResponse
} from '../../../../../graphql/request/handlers/explore/explore-query';
import { GraphQlQueryEventService } from '../../graphql-query-event.service';
import { TraceDonutDataSourceModel } from './trace-donut-data-source.model';

describe('Donut data source model', () => {
  const modelFactory = createModelFactory({
    providers: [mockProvider(GraphQlQueryEventService)]
  });

  const specBuilder = new ObservabilitySpecificationBuilder();
  const mockTimeRange = {
    startTime: new Date(1),
    endTime: new Date(2)
  };

  const getDataForQueryResponse = (
    model: TraceDonutDataSourceModel,
    response: GraphQlExploreResponse
  ): Observable<DonutSeriesResults> => {
    model.query$.pipe(take(1)).subscribe(query => {
      query.responseObserver.next(response);
      query.responseObserver.complete();
    });

    return model.getData();
  };

  test('should build expected query', () => {
    const spectator = modelFactory(TraceDonutDataSourceModel, {
      properties: {
        metric: specBuilder.metricAggregationSpecForKey('foo', MetricAggregationType.Sum),
        maxResults: 3,
        groupBy: specBuilder.attributeSpecificationForKey('bar')
      },
      api: {
        getTimeRange: jest.fn().mockReturnValue(mockTimeRange)
      }
    });

    const receivedQueries = recordObservable(spectator.model.query$.pipe(map(query => query.buildRequest([]))));

    spectator.model.getData();

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(receivedQueries).toBe('x', {
        x: {
          requestType: EXPLORE_GQL_REQUEST,
          context: ObservabilityTraceType.Api,
          timeRange: GraphQlTimeRange.fromTimeRange(mockTimeRange),
          filters: [],
          groupBy: {
            keys: ['bar'],
            limit: 3
          },
          limit: 3,
          selections: [
            expect.objectContaining({
              name: 'foo',
              aggregation: MetricAggregationType.Sum
            })
          ]
        }
      });
    });
  });

  test('should parse results', () => {
    const spectator = modelFactory(TraceDonutDataSourceModel, {
      properties: {
        metric: specBuilder.metricAggregationSpecForKey('foo', MetricAggregationType.Sum),
        groupBy: specBuilder.attributeSpecificationForKey('bar')
      },
      api: {
        getTimeRange: jest.fn().mockReturnValue(mockTimeRange)
      }
    });

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(
        getDataForQueryResponse(spectator.model, {
          results: [
            {
              'sum(foo)': {
                value: 10,
                type: AttributeMetadataType.Number
              },
              bar: {
                value: 'first',
                type: AttributeMetadataType.String
              }
            },
            {
              'sum(foo)': {
                value: 15,
                type: AttributeMetadataType.Number
              },
              bar: {
                value: 'second',
                type: AttributeMetadataType.String
              }
            }
          ]
        })
      ).toBe('(x|)', {
        x: {
          series: [
            {
              name: 'first',
              value: 10
            },
            {
              name: 'second',
              value: 15
            }
          ],
          total: 25
        }
      });
    });
  });
});
