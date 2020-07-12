import { isEqualIgnoreFunctions, TimeDuration, TimeUnit } from '@hypertrace/common';
import { createModelFactory } from '@hypertrace/dashboards/testing';
import { MetricAggregationType, SpecificationContextBuilder } from '@hypertrace/distributed-tracing';
import { MODEL_PROPERTY_TYPES } from '@hypertrace/hyperdash-angular';
import { mockProvider } from '@ngneat/spectator/jest';
import { ObservabilitySpecificationBuilder } from '../../../../graphql/request/builders/selections/observability-specification-builder';
import { MetricTimeseriesSpecificationModel } from './metric-timeseries-specification.model';

describe('Metric timeseries specification model', () => {
  test('matches spec from builder', () => {
    const modelFactory = createModelFactory();
    const mockContext = {
      getAutoInterval: () => new TimeDuration(3, TimeUnit.Minute)
    };

    const spectator = modelFactory(MetricTimeseriesSpecificationModel, {
      providers: [
        mockProvider(SpecificationContextBuilder, {
          buildContext: () => mockContext
        }),
        {
          provide: MODEL_PROPERTY_TYPES,
          useValue: []
        }
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
      mockContext,
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
