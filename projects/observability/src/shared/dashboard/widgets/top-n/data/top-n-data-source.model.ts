import { ENUM_TYPE, EnumPropertyTypeInstance } from '@hypertrace/dashboards';
import {
  AttributeSpecificationModel,
  GraphQlDataSourceModel,
  MetricAggregation
} from '@hypertrace/distributed-tracing';
import { Model, ModelProperty, ModelPropertyType, NUMBER_PROPERTY } from '@hypertrace/hyperdash';
import { Observable, of, EMPTY } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { Entity, entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import { MetricAggregationSpecification } from '../../../../graphql/model/schema/specifications/metric-aggregation-specification';
import { EntitiesResponse } from '../../../../graphql/request/handlers/entities/query/entities-graphql-query-builder.service';
import {
  ENTITIES_GQL_REQUEST,
  EntitiesGraphQlQueryHandlerService
} from '../../../../graphql/request/handlers/entities/query/entities-graphql-query-handler.service';

import { forkJoinSafeEmpty } from '@hypertrace/common';
import { TopNData } from '../../../../components/top-n/top-n-chart.component';
import { ExploreSpecificationBuilder } from '../../../../graphql/request/builders/specification/explore/explore-specification-builder';
import {
  ExploreGraphQlQueryHandlerService,
  EXPLORE_GQL_REQUEST
} from '../../../../graphql/request/handlers/explore/explore-graphql-query-handler.service';

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

  private readonly exploreSpecBuilder: ExploreSpecificationBuilder = new ExploreSpecificationBuilder();

  public getData(): Observable<TopNWidgetDataFetcher> {
    return of({
      scope: this.entityType,
      getData: (metricSpecification: MetricAggregationSpecification) => this.fetchData(metricSpecification)
    });
  }
  private fetchData(metricSpecification: MetricAggregationSpecification): Observable<TopNWidgetData> {
    return forkJoinSafeEmpty([
      this.fetchDataWithMetric(metricSpecification),
      this.fetchTotalValueForMetric(metricSpecification)
    ]).pipe(
      flatMap(([topNData, totalValue]) => {
        if (topNData.length > 0 && totalValue > 0) {
          return of({
            topNData: topNData,
            totalValue: totalValue
          });
        }
        return EMPTY;
      })
    );
  }

  private fetchDataWithMetric(metricSpecification: MetricAggregationSpecification): Observable<TopNEntityData[]> {
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

  private fetchTotalValueForMetric(metricSpecification: MetricAggregationSpecification): Observable<number> {
    const exploreSpecification = this.exploreSpecBuilder.exploreSpecificationForKey(
      metricSpecification.name,
      metricSpecification.aggregation
    );

    return this.queryWithNextBatch<ExploreGraphQlQueryHandlerService>(filters => ({
      requestType: EXPLORE_GQL_REQUEST,
      timeRange: this.getTimeRangeOrThrow(),
      context: this.entityType,
      filters: filters,
      limit: 1,
      selections: [exploreSpecification]
    })).pipe(
      map(response => response.results[0]),
      map(result => result[exploreSpecification.resultAlias()].value as number)
    );
  }
}

export interface TopNWidgetDataFetcher {
  scope: string;
  getData(metricSpecification: MetricAggregationSpecification): Observable<TopNWidgetData>;
}

export interface TopNWidgetData {
  topNData: TopNEntityData[];
  totalValue: number;
}

export interface TopNEntityData extends TopNData {
  entity: Entity;
}
