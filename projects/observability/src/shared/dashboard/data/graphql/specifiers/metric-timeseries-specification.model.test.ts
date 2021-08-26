import { IntervalDurationService, isEqualIgnoreFunctions, TimeDuration, TimeUnit } from '@hypertrace/common';
import { createModelFactory } from '@hypertrace/dashboards/testing';
import { MetricAggregationType } from '@hypertrace/observability';
import { mockProvider } from '@ngneat/spectator/jest';
import { ObservabilitySpecificationBuilder } from '../../../../graphql/request/builders/selections/observability-specification-builder';
import { MetricTimeseriesSpecificationModel } from './metric-timeseries-specification.model';

describe('Metric timeseries specification model', () => {
  const modelFactory = createModelFactory();
  test('matches spec from builder', () => {
    const spectator = modelFactory(MetricTimeseriesSpecificationModel, {
      providers: [
        mockProvider(IntervalDurationService, {
          getAutoDuration: () => new TimeDuration(3, TimeUnit.Minute)
        })
      ],
      properties: {
        aggregation: MetricAggregationType.Average,
        metric: 'test_metric',
        intervalDuration: 3,
        timeUnit: TimeUnit.Minute
      }
    });

    const expectedSpecObject = new ObservabilitySpecificationBuilder().metricTimeseriesSpec(
      'test_metric',
      MetricAggregationType.Average,
      new TimeDuration(3, TimeUnit.Minute)
    );

    expect(isEqualIgnoreFunctions(spectator.model, expectedSpecObject));

    expect(spectator.model.asGraphQlOrderByFragment()).toEqual(expectedSpecObject.asGraphQlOrderByFragment());
    expect(spectator.model.asGraphQlSelections()).toEqual(expectedSpecObject.asGraphQlSelections());
    expect(spectator.model.getIntervalDuration()).toEqual(expectedSpecObject.getIntervalDuration());
    expect(spectator.model.resultAlias()).toEqual(expectedSpecObject.resultAlias());

    expect(spectator.model.withNewIntervalDuration(new TimeDuration(3, TimeUnit.Minute)).asGraphQlSelections()).toEqual(
      expectedSpecObject.withNewIntervalDuration(new TimeDuration(3, TimeUnit.Minute)).asGraphQlSelections()
    );
  });
});
