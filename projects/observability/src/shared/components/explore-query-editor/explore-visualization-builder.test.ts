import { fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
  FeatureState,
  FeatureStateResolver,
  FixedTimeRange,
  IntervalDurationService,
  TimeDuration,
  TimeRangeService,
  TimeUnit
} from '@hypertrace/common';
import { GRAPHQL_OPTIONS } from '@hypertrace/graphql-client';
import { patchRouterNavigateForTest, recordObservable, runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { MetricAggregationType } from '../../graphql/model/metrics/metric-aggregation';
import { ObservabilityTraceType } from '../../graphql/model/schema/observability-traces';
import { ExploreSpecificationBuilder } from '../../graphql/request/builders/specification/explore/explore-specification-builder';
import { MetadataService } from '../../services/metadata/metadata.service';
import { CartesianSeriesVisualizationType } from '../cartesian/chart';
import { ExploreVisualizationBuilder, ExploreVisualizationRequest } from './explore-visualization-builder';

describe('Explore visualization builder', () => {
  const createBuilder = createServiceFactory({
    service: ExploreVisualizationBuilder,
    imports: [RouterTestingModule],
    providers: [
      mockProvider(MetadataService, {
        getAttribute: jest.fn((_, key) =>
          of({
            name: key,
            onlySupportsAggregation: false,
            onlySupportsGrouping: false
          })
        )
      }),
      mockProvider(IntervalDurationService, {
        getAutoDuration: () => new TimeDuration(3, TimeUnit.Minute)
      }),
      mockProvider(FeatureStateResolver, {
        getFeatureState: () => of(FeatureState.Enabled)
      }),
      {
        provide: GRAPHQL_OPTIONS,
        useValue: {
          uri: '/graphql',
          batchSize: 2
        }
      }
    ]
  });

  let spectator: SpectatorService<ExploreVisualizationBuilder>;
  let timeRangeService: TimeRangeService;
  const defaultTimeRange = new FixedTimeRange(new Date(1573255111159), new Date(1573255111160));
  const matchSeriesWithName = (name: string) =>
    expect.objectContaining({
      specification: expect.objectContaining({
        name: name
      })
    });

  const expectedQuery = (queryPartial: Partial<ExploreVisualizationRequest> = {}): ExploreVisualizationRequest =>
    expect.objectContaining({
      context: ObservabilityTraceType.Api,
      interval: 'AUTO',
      series: [matchSeriesWithName('calls')],
      ...queryPartial
    });

  const buildSeries = (key: string, aggregation?: MetricAggregationType) => ({
    specification: new ExploreSpecificationBuilder().exploreSpecificationForKey(key, aggregation),
    visualizationOptions: {
      type: CartesianSeriesVisualizationType.Column
    }
  });

  beforeEach(() => {
    spectator = createBuilder();
    patchRouterNavigateForTest(spectator);
    timeRangeService = spectator.inject(TimeRangeService);
    timeRangeService.setFixedRange(defaultTimeRange.startTime, defaultTimeRange.endTime);
  });

  test('defaults to single series query', () => {
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.visualizationRequest$).toBe('10ms x', { x: expectedQuery() });
    });
  });

  test('plays back current query for late subscribers', fakeAsync(() => {
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.visualizationRequest$).toBe('10ms x', { x: expectedQuery() });
      tick(10000);
      expectObservable(spectator.service.visualizationRequest$).toBe('10ms x', { x: expectedQuery() });
    });
  }));

  test('debounces then notifies on query change', () => {
    runFakeRxjs(({ expectObservable }) => {
      const recordedRequests = recordObservable(spectator.service.visualizationRequest$);

      spectator.service
        .setSeries([buildSeries('test1')])
        .groupBy({
          keyExpressions: [{ key: 'testGroupBy' }],
          limit: 15
        })
        .setSeries([buildSeries('test2')]);

      expectObservable(recordedRequests).toBe('10ms x', {
        x: expectedQuery({
          series: [matchSeriesWithName('test2')],
          groupBy: { keyExpressions: [{ key: 'testGroupBy' }], limit: 15 }
        })
      });
    });
  });

  test('overwrites query with new state on reset', () => {
    runFakeRxjs(({ expectObservable }) => {
      const recordedRequests = recordObservable(spectator.service.visualizationRequest$);
      spectator.service.setSeries([buildSeries('test1')]).reset();

      expectObservable(recordedRequests).toBe('10ms x', {
        x: expectedQuery()
      });
    });
  });
});
