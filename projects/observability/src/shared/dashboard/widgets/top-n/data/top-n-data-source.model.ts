import { EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import {
  AttributeSpecificationModel,
  GraphQlDataSourceModel,
  MetricAggregation
} from '@hypertrace/distributed-tracing';
import { Model, ModelProperty, ModelPropertyType, NUMBER_PROPERTY } from '@hypertrace/hyperdash';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Entity, entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import { MetricAggregationSpecification } from '../../../../graphql/model/schema/specifications/metric-aggregation-specification';
import { EntitiesResponse } from '../../../../graphql/request/handlers/entities/query/entities-graphql-query-builder.service';
import {
  EntitiesGraphQlQueryHandlerService,
  ENTITIES_GQL_REQUEST
} from '../../../../graphql/request/handlers/entities/query/entities-graphql-query-handler.service';

@Model({
  type: 'top-n-data-source'
})
export class TopNDataSourceModel extends GraphQlDataSourceModel<TopNWidgetDataFetcher> {
  @ModelProperty({
    key: 'entity',
    required: true,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [ObservabilityEntityType.Service, ObservabilityEntityType.Api]
    } as EnumPropertyTypeInstance
  })
  public entityType!: ObservabilityEntityType;

  @ModelProperty({
    key: 'attribute',
    type: ModelPropertyType.TYPE,
    required: true
  })
  public attributeSpecification!: AttributeSpecificationModel;

  @ModelProperty({
    key: 'result-limit',
    displayName: 'Result Limit',
    type: NUMBER_PROPERTY.type
  })
  public resultLimit: number = 10;

  public getData(): Observable<TopNWidgetDataFetcher> {
    return of({
      scope: this.entityType,
      getData: (metricSpecification: MetricAggregationSpecification) => this.fetchDataWithMetric(metricSpecification)
    });
  }

  private fetchDataWithMetric(metricSpecification: MetricAggregationSpecification): Observable<TopNWidgetValueData[]> {
    return this.queryWithNextBatch<EntitiesGraphQlQueryHandlerService, EntitiesResponse>(filters => ({
      requestType: ENTITIES_GQL_REQUEST,
      entityType: this.entityType,
      limit: this.resultLimit,
      timeRange: this.getTimeRangeOrThrow(),
      properties: [this.attributeSpecification, metricSpecification],
      filters: filters,
      sort: {
        direction: 'DESC',
        key: metricSpecification
      }
    })).pipe(
      map(response =>
        response.results.map(entity => ({
          label: entity[this.attributeSpecification.resultAlias()] as string,
          value: (entity[metricSpecification.resultAlias()] as MetricAggregation).value,
          entity: {
            [entityIdKey]: entity[entityIdKey],
            [entityTypeKey]: this.entityType
          }
        }))
      )
    );
  }
}

export interface TopNWidgetDataFetcher {
  scope: string;
  getData(metricSpecification: MetricAggregationSpecification): Observable<TopNWidgetValueData[]>;
}

export interface TopNWidgetValueData {
  label: string;
  value: number;
  entity: Entity;
}
