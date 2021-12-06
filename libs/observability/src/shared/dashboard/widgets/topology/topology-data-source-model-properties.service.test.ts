import { Color } from '@hypertrace/common';
import { createServiceFactory } from '@ngneat/spectator/jest';
import { MetricAggregationType } from '../../../graphql/model/metrics/metric-aggregation';
import { MetricAggregationSpecificationModel } from '../../data/graphql/specifiers/metric-aggregation-specification.model';
import { TopologyMetricCategoryModel } from '../../data/graphql/topology/metrics/topology-metric-category.model';
import { TopologyMetricWithCategoryModel } from '../../data/graphql/topology/metrics/topology-metric-with-category.model';
import { TopologyMetricsData } from '../../data/graphql/topology/metrics/topology-metrics.model';
import { TopologyDataSourceModelPropertiesService } from './topology-data-source-model-properties.service';

describe('TopologyDataSourceModelPropertiesService', () => {
  const createService = createServiceFactory({
    service: TopologyDataSourceModelPropertiesService
  });

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

  const createSpecificationModel = (metric: string, aggregation: MetricAggregationType) => {
    const specification = new MetricAggregationSpecificationModel();
    specification.metric = metric;
    specification.aggregation = aggregation;

    specification.modelOnInit();

    return specification;
  };

  const createMetricWithCategory = (
    spec: MetricAggregationSpecificationModel,
    categories: TopologyMetricCategoryModel[]
  ) => {
    const model = new TopologyMetricWithCategoryModel();
    model.specification = spec;
    model.categories = categories;

    return model;
  };

  test('should return correct results', () => {
    const spectator = createService();

    const nodePrimary = createMetricWithCategory(
      createSpecificationModel('node-metric-1', MetricAggregationType.Average),
      [
        createCategoryModel('node-first-1', 0, Color.Blue2, Color.Blue3, Color.Blue4, 10),
        createCategoryModel('node-second-1', 10, Color.Red1, Color.Red3, Color.Red4, 50),
        createCategoryModel('node-third-1', 50, Color.Blue2, Color.Blue3, Color.Blue4)
      ]
    );

    const nodeSecondary = createMetricWithCategory(
      createSpecificationModel('node-metric-2', MetricAggregationType.Average),
      [
        createCategoryModel('node-first-2', 0, Color.Blue2, Color.Blue3, Color.Blue4, 10),
        createCategoryModel('node-second-2', 10, Color.Red1, Color.Red3, Color.Red4, 50),
        createCategoryModel('node-third-2', 50, Color.Blue2, Color.Blue3, Color.Blue4)
      ]
    );

    const nodeOthers = [
      createMetricWithCategory(createSpecificationModel('node-metric-5', MetricAggregationType.Average), [
        createCategoryModel('node-others-2', 0, Color.Blue2, Color.Blue3, Color.Blue4, 10)
      ])
    ];

    const nodeMetrics: TopologyMetricsData = {
      primary: nodePrimary,
      secondary: nodeSecondary,
      others: nodeOthers
    };

    const edgePrimary = createMetricWithCategory(
      createSpecificationModel('edge-metric-3', MetricAggregationType.Average),
      [
        createCategoryModel('edge-first-1', 0, Color.Blue2, Color.Blue3, Color.Blue4, 10),
        createCategoryModel('edge-second-1', 10, Color.Red1, Color.Red3, Color.Red4, 50),
        createCategoryModel('edge-third-1', 50, Color.Blue2, Color.Blue3, Color.Blue4)
      ]
    );

    const edgeSecondary = createMetricWithCategory(
      createSpecificationModel('metric-4', MetricAggregationType.Average),
      [
        createCategoryModel('edge-first-2', 0, Color.Blue2, Color.Blue3, Color.Blue4, 10),
        createCategoryModel('edge-second-2', 10, Color.Red1, Color.Red3, Color.Red4, 50),
        createCategoryModel('edge-third-2', 50, Color.Blue2, Color.Blue3, Color.Blue4)
      ]
    );

    const edgeOthers = [
      createMetricWithCategory(createSpecificationModel('metric-4', MetricAggregationType.Average), [
        createCategoryModel('edge-others-2', 0, Color.Blue2, Color.Blue3, Color.Blue4, 10)
      ])
    ];

    const edgeMetrics: TopologyMetricsData = {
      primary: edgePrimary,
      secondary: edgeSecondary,
      others: edgeOthers
    };
    spectator.service.setModelProperties(nodeMetrics, edgeMetrics);

    expect(spectator.service.getPrimaryNodeMetric()).toEqual(nodePrimary);
    expect(spectator.service.getSecondaryNodeMetric()).toEqual(nodeSecondary);

    expect(spectator.service.getPrimaryEdgeMetric()).toEqual(edgePrimary);
    expect(spectator.service.getSecondaryEdgeMetric()).toEqual(edgeSecondary);
  });
});
