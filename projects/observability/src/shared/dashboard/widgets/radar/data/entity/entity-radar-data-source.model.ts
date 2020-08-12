import { GraphQlFilter, GraphQlTimeRange, MetricAggregation, Specification } from '@hypertrace/distributed-tracing';
import { ARRAY_PROPERTY, Model, ModelProperty } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RadarPoint } from '../../../../../components/radar/radar';
import { Entity } from '../../../../../graphql/model/schema/entity';
import { findEntityFilterOrThrow } from '../../../../../graphql/model/schema/filter/entity/graphql-entity-filter';
import {
  EntityGraphQlQueryHandlerService,
  ENTITY_GQL_REQUEST,
  GraphQlEntityRequest
} from '../../../../../graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';
import { RadarDataSourceModel } from '../radar-data-source.model';

@Model({
  type: 'entity-radar-data-source'
})
export class EntityRadarDataSourceModel extends RadarDataSourceModel {
  @ModelProperty({
    key: 'metrics',
    type: ARRAY_PROPERTY.type,
    required: false
  })
  public metricSpecifications: Specification[] = [];

  protected fetchData(timeRange: GraphQlTimeRange): Observable<RadarPoint[]> {
    return this.query<EntityGraphQlQueryHandlerService, Entity>(filters => this.buildRequest(timeRange, filters)).pipe(
      map(entity => this.buildDataPointsFromEntity(entity))
    );
  }

  private buildRequest(timeRange: GraphQlTimeRange, inheritedFilters: GraphQlFilter[]): GraphQlEntityRequest {
    const entityFilter = findEntityFilterOrThrow(inheritedFilters);

    return {
      requestType: ENTITY_GQL_REQUEST,
      timeRange: timeRange,
      properties: this.metricSpecifications,
      entityType: entityFilter.type,
      id: entityFilter.id
    };
  }

  private buildDataPointsFromEntity(entity: Entity): RadarPoint[] {
    return this.metricSpecifications.map(specification => ({
      axis: specification.displayName ?? specification.name,
      value: (entity[specification.resultAlias()] as MetricAggregation).value
    }));
  }
}
