import { Color } from '@hypertrace/common';
import { createModelFactory } from '@hypertrace/dashboards/testing';
import { MetricAggregationType } from '@hypertrace/observability';
import { MetricAggregationSpecificationModel } from '../../specifiers/metric-aggregation-specification.model';
import { TopologyMetricCategoryModel } from './topology-metric-category.model';
import { TopologyMetricWithCategoryModel } from './topology-metric-with-category.model';

describe('Topology Metric with category model', () => {
  const modelFactory = createModelFactory();

  const createCategoryModel = (
    name: string,
    minValue: number,
    fillColor: Color,
    strokeColor: Color,
    focusColor: Color,
    maxValue?: number
  ): TopologyMetricCategoryModel => {
    const categoryModel = new TopologyMetricCategoryModel();
    categoryModel.name = name;
    categoryModel.minValue = minValue;
    categoryModel.maxValue = maxValue;
    categoryModel.fillColor = fillColor;
    categoryModel.strokeColor = strokeColor;
    categoryModel.focusColor = focusColor;

    return categoryModel;
  };
  test('provides category name correctly', () => {
    const specification = new MetricAggregationSpecificationModel();
    specification.metric = 'metric-name';
    specification.aggregation = MetricAggregationType.Average;
    specification.modelOnInit();

    const categories = [
      createCategoryModel('first', 0, Color.Blue2, Color.Blue3, Color.Blue4, 10),
      createCategoryModel('second', 10, Color.Red1, Color.Red3, Color.Red4, 50),
      createCategoryModel('third', 50, Color.Blue2, Color.Blue3, Color.Blue4)
    ];

    const spectator = modelFactory(TopologyMetricWithCategoryModel, {
      properties: {
        specification: specification,
        categories: categories
      }
    });

    expect(
      spectator.model.extractAndGetDataCategoryForMetric({
        [specification.resultAlias()]: { value: 50 }
      })
    ).toEqual(categories[2]);

    expect(
      spectator.model.extractAndGetDataCategoryForMetric({
        [specification.resultAlias()]: { value: 5 }
      })
    ).toEqual(categories[0]);

    expect(
      spectator.model.extractAndGetDataCategoryForMetric({
        [specification.resultAlias()]: { value: 22 }
      })
    ).toEqual(categories[1]);

    expect(
      spectator.model.extractAndGetDataCategoryForMetric({
        [specification.resultAlias()]: { value: -10 }
      })
    ).toEqual(undefined);
  });
});
