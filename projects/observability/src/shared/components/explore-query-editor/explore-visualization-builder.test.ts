import { fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FixedTimeRange, IntervalDurationService, TimeDuration, TimeRangeService, TimeUnit } from '@hypertrace/common';
import { MetadataService, MetricAggregationType } from '@hypertrace/distributed-tracing';
import { patchRouterNavigateForTest, recordObservable, runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { ObservabilityTraceType } from '../../graphql/model/schema/observability-traces';
import { ExploreSpecificationBuilder } from '../../graphql/request/builders/specification/explore/explore-specification-builder';
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
      })
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
      interval: new TimeDuration(3, TimeUnit.Minute),
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
      expectObservable(spectator.service.visualizationRequest$).toBe('x', { x: expectedQuery() });
    });
  });

  test('plays back current query for late subscribers', fakeAsync(() => {
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.visualizationRequest$).toBe('x', { x: expectedQuery() });
      tick(10000);
      expectObservable(spectator.service.visualizationRequest$).toBe('x', { x: expectedQuery() });
    });
  }));

  test('notifies on query change', () => {
    runFakeRxjs(({ expectObservable }) => {
      const recordedRequests = recordObservable(spectator.service.visualizationRequest$);

      spectator.service
        .setSeries([buildSeries('test1')])
        .groupBy({
          keys: ['testGroupBy'],
          limit: 15
        })
        .setSeries([buildSeries('test2')]);

      expectObservable(recordedRequests).toBe('(abcd)', {
        a: expectedQuery(),
        b: expectedQuery({
          series: [matchSeriesWithName('test1')]
        }),
        c: expectedQuery({
          series: [matchSeriesWithName('test1')],
          groupBy: { keys: ['testGroupBy'], limit: 15 }
        }),
        d: expectedQuery({
          series: [matchSeriesWithName('test2')],
          groupBy: { keys: ['testGroupBy'], limit: 15 }
        })
      });
    });
  });

  test('clears full query on empty', () => {
    runFakeRxjs(({ expectObservable }) => {
      const recordedRequests = recordObservable(spectator.service.visualizationRequest$);
      spectator.service.setSeries([buildSeries('test1')]).empty();

      expectObservable(recordedRequests).toBe('(xyx)', {
        x: expectedQuery(),
        y: expectedQuery({ series: [matchSeriesWithName('test1')] })
      });
    });
  });

  test('overwrites query with new state on reset', () => {
    runFakeRxjs(({ expectObservable }) => {
      const recordedRequests = recordObservable(spectator.service.visualizationRequest$);
      spectator.service.setSeries([buildSeries('test1')]).reset();

      expectObservable(recordedRequests).toBe('(xyz)', {
        x: expectedQuery(),
        y: expectedQuery({ series: [matchSeriesWithName('test1')] }),
        z: expectedQuery()
      });
    });
  });
});
