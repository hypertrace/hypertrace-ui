import { Injectable } from '@angular/core';
import { TopologyMetricCategoryData } from '../../data/graphql/topology/metrics/topology-metric-category.model';
import { TopologyMetricWithCategoryData } from '../../data/graphql/topology/metrics/topology-metric-with-category.model';
import { TopologyMetricsData } from '../../data/graphql/topology/metrics/topology-metrics.model';

@Injectable()
export class TopologyDataSourceModelPropertiesService {
  private nodeMetrics?: TopologyMetricsData;
  private edgeMetrics?: TopologyMetricsData;

  public setModelProperties(nodeMetrics: TopologyMetricsData, edgeMetrics: TopologyMetricsData): void {
    this.nodeMetrics = nodeMetrics;
    this.edgeMetrics = edgeMetrics;
  }

  public getPrimaryNodeMetric(): TopologyMetricWithCategoryData | undefined {
    return this.nodeMetrics?.primary
  }

  public getSecondaryNodeMetric(): TopologyMetricWithCategoryData | undefined {
    return this.nodeMetrics?.secondary
  }

  public getPrimaryEdgeMetric(): TopologyMetricWithCategoryData | undefined {
    return this.edgeMetrics?.primary
  }

  public getSecondaryEdgeMetric(): TopologyMetricWithCategoryData | undefined {
    return this.edgeMetrics?.secondary
  }

  public getAllNodeCategories(): TopologyMetricCategoryData[] {
    return [this.nodeMetrics?.primary, this.nodeMetrics?.secondary, this.nodeMetrics?.others].flat().map(categoryData => categoryData?.categories ?? []).flat();
  }

  public getAllEdgeCategories(): TopologyMetricCategoryData[] {
    return [this.edgeMetrics?.primary, this.edgeMetrics?.secondary, this.edgeMetrics?.others].flat().map(categoryData => categoryData?.categories ?? []).flat();
  }
}
