import { createModelFactory, SpectatorModel } from '@hypertrace/dashboards/testing';
import { MetricAggregation, MetricHealth } from '@hypertrace/observability';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { of } from 'rxjs';
import { MetricDisplayWidgetModel } from './metric-display-widget.model';

describe('Metric display widget model', () => {
  const modelFactory = createModelFactory();
  const buildModel = (data: MetricAggregation): SpectatorModel<MetricDisplayWidgetModel> =>
    modelFactory(MetricDisplayWidgetModel, {
      api: {
        getData: () => of(data)
      }
    });

  test('can normalize data', () => {
    const spectator = buildModel({
      value: 10,
      health: MetricHealth.Healthy,
      units: 'ms'
    });

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.model.getData()).toBe('(x|)', {
        x: {
          value: 10,
          health: MetricHealth.Healthy,
          units: 'ms'
        }
      });
    });
  });
});
