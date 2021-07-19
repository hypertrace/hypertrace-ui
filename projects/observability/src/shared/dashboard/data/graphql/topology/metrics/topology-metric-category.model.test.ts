import { Color } from '@hypertrace/common';
import { createModelFactory } from '@hypertrace/dashboards/testing';
import { TopologyMetricCategoryModel } from './topology-metric-category.model';

describe('Topology Metric with category model', () => {
  const modelFactory = createModelFactory();

  test('provides category name correctly', () => {
    const spectator = modelFactory(TopologyMetricCategoryModel, {
      properties: {
        name: 'test name',
        minValue: 0,
        maxValue: 10,
        fillColor: Color.Blue2,
        strokeColor: Color.Blue3,
        focusColor: Color.Blue4
      }
    });

    expect(spectator.model.getCategoryClassName()).toContain('test-name');
  });
});
