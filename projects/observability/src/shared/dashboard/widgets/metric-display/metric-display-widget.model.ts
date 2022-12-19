import { BOOLEAN_PROPERTY, Model, ModelApi, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { defaults } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { MetricAggregation } from '../../../graphql/model/metrics/metric-aggregation';
import { MetricHealth } from '../../../graphql/model/metrics/metric-health';
import { EntityMetricAggregationDataSourceModel } from '../../data/graphql/entity/aggregation/entity-metric-aggregation-data-source.model';
import { EntityAttributeDataSourceModel } from '../../data/graphql/entity/attribute/entity-attribute-data-source.model';
import { ExplorerVisualizationCartesianDataSourceModel } from '../../data/graphql/explorer-visualization/explorer-visualization-cartesian-data-source.model';

@Model({
  type: 'metric-display-widget',
  supportedDataSourceTypes: [
    EntityMetricAggregationDataSourceModel,
    EntityAttributeDataSourceModel,
    ExplorerVisualizationCartesianDataSourceModel
  ]
})
export class MetricDisplayWidgetModel {
  public static readonly METRIC_WIDGET_DEFAULTS: MetricWidgetValueData = {
    value: '-',
    units: '',
    health: MetricHealth.NotSpecified
  };

  @ModelProperty({
    key: 'title',
    type: STRING_PROPERTY.type
  })
  public title?: string;

  @ModelProperty({
    key: 'title-position',
    type: STRING_PROPERTY.type
  })
  public titlePosition?: string;

  @ModelProperty({
    key: 'showUnits',
    type: BOOLEAN_PROPERTY.type
  })
  public showUnits?: boolean;

  @ModelProperty({
    key: 'subtitle',
    type: STRING_PROPERTY.type
  })
  public subtitle?: string;

  @ModelProperty({
    key: 'superscript',
    type: STRING_PROPERTY.type
  })
  public superscript?: string;

  @ModelProperty({
    key: 'subscript',
    type: STRING_PROPERTY.type
  })
  public subscript?: string;

  @ModelProperty({
    key: 'size',
    type: STRING_PROPERTY.type,
    required: false
  })
  public size?: string;

  @ModelProperty({
    key: 'metric-key',
    type: STRING_PROPERTY.type,
    required: false
  })
  public metricKey?: string;

  @ModelInject(MODEL_API)
  public api!: ModelApi;

  public getData(): Observable<MetricWidgetValueData> {
    return this.api.getData<unknown>().pipe(
      // tslint:disable-next-line: no-any
      mergeMap((receivedValue: any) => {
        if (typeof receivedValue === 'object' && receivedValue.value === undefined) {
          return this.normalizeData(receivedValue[this.metricKey!].value);
        }

        return this.normalizeData(receivedValue);
      })
    );
  }

  private normalizeData(metricValue: unknown): Observable<MetricWidgetValueData> {
    try {
      return of(
        defaults(
          {
            value: this.extractValue(metricValue),
            units: this.extractUnits(metricValue),
            health: this.extractHealth(metricValue)
          },
          MetricDisplayWidgetModel.METRIC_WIDGET_DEFAULTS
        )
      );
    } catch (e) {
      throw e;
    }
  }

  private extractValue(metricValue: unknown): number {
    if (typeof metricValue === 'number') {
      return metricValue;
    }
    if (this.valueIsMetricAgg(metricValue, 'value')) {
      return this.extractValue(metricValue.value);
    }
    throw Error('Data received in unrecognized form');
  }

  public extractUnits(metricValue: unknown): string {
    switch (typeof metricValue) {
      case 'number':
        return '';
      case 'string':
        return metricValue;
      default:
      // No case - continue
    }
    if (this.valueIsMetricAgg(metricValue, 'units')) {
      return this.extractUnits(metricValue.units);
    }
    throw Error('Data received in unrecognized form');
  }

  private extractHealth(metricValue: unknown): MetricHealth {
    if (!this.valueIsMetricAgg(metricValue, 'health')) {
      return MetricHealth.NotSpecified;
    }

    return metricValue.health;
  }

  private valueIsMetricAgg<K extends keyof MetricAggregation>(
    value: unknown,
    requireKey: K
  ): value is Partial<MetricAggregation> & Pick<MetricAggregation, K> {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    return requireKey in value;
  }
}

export interface MetricWidgetValueData {
  value: number | string;
  units: string;
  health: MetricHealth;
}
