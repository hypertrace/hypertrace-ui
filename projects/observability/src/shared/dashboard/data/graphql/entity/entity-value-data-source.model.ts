import { Dictionary } from '@hypertrace/common';
import { GraphQlDataSourceModel, GraphQlFilter, Specification } from '@hypertrace/observability';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Entity } from '../../../../graphql/model/schema/entity';
import { findEntityFilterOrThrow } from '../../../../graphql/model/schema/filter/entity/graphql-entity-filter';
import {
  EntityGraphQlQueryHandlerService,
  ENTITY_GQL_REQUEST,
  GraphQlEntityRequest
} from '../../../../graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';

export abstract class EntityValueDataSourceModel<TData, TResponse = TData> extends GraphQlDataSourceModel<TData> {
  protected abstract specification: Specification;

  protected fetchSpecificationData<T = TResponse>(specification: Specification = this.specification): Observable<T> {
    return this.query<EntityGraphQlQueryHandlerService, Entity & Dictionary<T>>(filters =>
      this.buildRequest(specification, filters)
    ).pipe(map(response => response[specification.resultAlias()]));
  }

  private buildRequest(specification: Specification, inheritedFilters: GraphQlFilter[]): GraphQlEntityRequest {
    const entityFilter = findEntityFilterOrThrow(inheritedFilters);

    return {
      requestType: ENTITY_GQL_REQUEST,
      properties: [specification],
      timeRange: this.getTimeRangeOrThrow(),
      entityType: entityFilter.type,
      id: entityFilter.id
    };
  }
}
