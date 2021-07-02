import { Injectable } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { EdgeMetric, MetricData, NodeMetric } from './metric/metric';

@Injectable()
export class TopologyDataSourceModelPropertiesService {
  private modelProperties: Dictionary<unknown> = {};

  public setModelProperties(modelProperties: Dictionary<unknown>): void {
    this.modelProperties = modelProperties;
  }

  public getPrimaryNodeMetric(): NodeMetric | undefined {
    return (this.modelProperties.nodeMetrics as MetricData)?.primary as NodeMetric;
  }

  public geSecondaryNodeMetric(): NodeMetric | undefined {
    return (this.modelProperties.nodeMetrics as MetricData)?.secondary as NodeMetric;
  }

  public getPrimaryEdgeMetric(): EdgeMetric | undefined {
    return (this.modelProperties.edgeMetrics as MetricData)?.primary as EdgeMetric;
  }

  public geSecondaryEdgeMetric(): EdgeMetric | undefined {
    return (this.modelProperties.edgeMetrics as MetricData)?.secondary as EdgeMetric;
  }
}
