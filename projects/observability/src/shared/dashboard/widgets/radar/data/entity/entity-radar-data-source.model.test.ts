import { fakeAsync, tick } from '@angular/core/testing';
import { isEqualIgnoreFunctions, TimeDuration, TimeUnit } from '@hypertrace/common';
import { GraphQlTimeRange, MetricAggregationType } from '@hypertrace/distributed-tracing';
import { ModelApi } from '@hypertrace/hyperdash';
import { mergeMap } from 'rxjs/operators';
import { ObservabilityEntityType } from '../../../../../graphql/model/schema/entity';
import { GraphQlEntityFilter } from '../../../../../graphql/model/schema/filter/entity/graphql-entity-filter';
import { ObservabilitySpecificationBuilder } from '../../../../../graphql/request/builders/selections/observability-specification-builder';
import {
  ENTITY_GQL_REQUEST,
  GraphQlEntityRequest
} from '../../../../../graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';
import { EntityRadarDataSourceModel } from './entity-radar-data-source.model';

describe('Entity radar data source model', () => {
  const metricSpecBuilder = new ObservabilitySpecificationBuilder();
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model!: EntityRadarDataSourceModel;
  let emittedQueries: GraphQlEntityRequest[];

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };

    model = new EntityRadarDataSourceModel();
    model.metricSpecifications = [
      metricSpecBuilder.metricAggregationSpecForKey('duration', MetricAggregationType.Sum),
      metricSpecBuilder.metricAggregationSpecForKey('numCalls', MetricAggregationType.Sum)
    ];

    model.api = mockApi as ModelApi;
    emittedQueries = [];
    model.query$.subscribe(query =>
      emittedQueries.push(
        query.buildRequest([new GraphQlEntityFilter('test-id', ObservabilityEntityType.Api)]) as GraphQlEntityRequest
      )
    );
  });

  test('builds expected Entity requests for Last Hour', fakeAsync(() => {
    model
      .getData()
      .pipe(mergeMap(fetcher => fetcher.getData(new TimeDuration(1, TimeUnit.Hour))))
      .subscribe(() => {
        // NOOP
      });

    tick();
    const expectedQueries: GraphQlEntityRequest[] = [
      {
        requestType: ENTITY_GQL_REQUEST,
        entityType: ObservabilityEntityType.Api,
        id: 'test-id',
        timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
        properties: [
          metricSpecBuilder.metricAggregationSpecForKey('duration', MetricAggregationType.Sum),
          metricSpecBuilder.metricAggregationSpecForKey('numCalls', MetricAggregationType.Sum)
        ]
      },
      {
        requestType: ENTITY_GQL_REQUEST,
        entityType: ObservabilityEntityType.Api,
        id: 'test-id',
        timeRange: new GraphQlTimeRange(
          new Date(testTimeRange.startTime.valueOf() - new TimeDuration(1, TimeUnit.Hour).toMillis()),
          new Date(testTimeRange.endTime.valueOf() - new TimeDuration(1, TimeUnit.Hour).toMillis())
        ),
        properties: [
          metricSpecBuilder.metricAggregationSpecForKey('duration', MetricAggregationType.Sum),
          metricSpecBuilder.metricAggregationSpecForKey('numCalls', MetricAggregationType.Sum)
        ]
      }
    ];

    expect(isEqualIgnoreFunctions(emittedQueries, expectedQueries)).toBe(true);
  }));

  test('builds expected Entity requests for Last Day', fakeAsync(() => {
    model
      .getData()
      .pipe(mergeMap(fetcher => fetcher.getData(new TimeDuration(1, TimeUnit.Day))))
      .subscribe(() => {
        // NOOP
      });

    tick();
    const expectedQueries: GraphQlEntityRequest[] = [
      {
        requestType: ENTITY_GQL_REQUEST,
        entityType: ObservabilityEntityType.Api,
        id: 'test-id',
        timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
        properties: [
          metricSpecBuilder.metricAggregationSpecForKey('duration', MetricAggregationType.Sum),
          metricSpecBuilder.metricAggregationSpecForKey('numCalls', MetricAggregationType.Sum)
        ]
      },
      {
        requestType: ENTITY_GQL_REQUEST,
        entityType: ObservabilityEntityType.Api,
        id: 'test-id',
        timeRange: new GraphQlTimeRange(
          new Date(testTimeRange.startTime.valueOf() - new TimeDuration(1, TimeUnit.Day).toMillis()),
          new Date(testTimeRange.endTime.valueOf() - new TimeDuration(1, TimeUnit.Day).toMillis())
        ),
        properties: [
          metricSpecBuilder.metricAggregationSpecForKey('duration', MetricAggregationType.Sum),
          metricSpecBuilder.metricAggregationSpecForKey('numCalls', MetricAggregationType.Sum)
        ]
      }
    ];

    expect(isEqualIgnoreFunctions(emittedQueries, expectedQueries)).toBe(true);
  }));

  test('builds expected Entity requests for Last Month', fakeAsync(() => {
    model
      .getData()
      .pipe(mergeMap(fetcher => fetcher.getData(new TimeDuration(1, TimeUnit.Month))))
      .subscribe(() => {
        // NOOP
      });

    tick();
    const expectedQueries: GraphQlEntityRequest[] = [
      {
        requestType: ENTITY_GQL_REQUEST,
        entityType: ObservabilityEntityType.Api,
        id: 'test-id',
        timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
        properties: [
          metricSpecBuilder.metricAggregationSpecForKey('duration', MetricAggregationType.Sum),
          metricSpecBuilder.metricAggregationSpecForKey('numCalls', MetricAggregationType.Sum)
        ]
      },
      {
        requestType: ENTITY_GQL_REQUEST,
        entityType: ObservabilityEntityType.Api,
        id: 'test-id',
        timeRange: new GraphQlTimeRange(
          new Date(testTimeRange.startTime.valueOf() - new TimeDuration(1, TimeUnit.Month).toMillis()),
          new Date(testTimeRange.endTime.valueOf() - new TimeDuration(1, TimeUnit.Month).toMillis())
        ),
        properties: [
          metricSpecBuilder.metricAggregationSpecForKey('duration', MetricAggregationType.Sum),
          metricSpecBuilder.metricAggregationSpecForKey('numCalls', MetricAggregationType.Sum)
        ]
      }
    ];

    expect(isEqualIgnoreFunctions(emittedQueries, expectedQueries)).toBe(true);
  }));
});
