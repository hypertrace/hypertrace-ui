import { GraphQlDataSourceModel, GraphQlFilter, Specification } from '@hypertrace/distributed-tracing';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityType } from '../../../../graphql/model/schema/entity';
import { EntitiesResponse } from '../../../../graphql/request/handlers/entities/query/entities-graphql-query-builder.service';
import {
  EntitiesGraphQlQueryHandlerService,
  ENTITIES_GQL_REQUEST,
  GraphQlEntitiesQueryRequest
} from '../../../../graphql/request/handlers/entities/query/entities-graphql-query-handler.service';

export abstract class EntitiesValuesDataSourceModel extends GraphQlDataSourceModel<unknown[]> {
  protected abstract specification: Specification;
  protected abstract entityType: EntityType;

  protected fetchSpecificationData(): Observable<unknown[]> {
    return this.query<EntitiesGraphQlQueryHandlerService, EntitiesResponse>(filters =>
      this.buildRequest(this.specification, filters)
    ).pipe(
      map(response => response.results),
      map(results => results.map(result => result[this.specification.resultAlias()]))
    );
  }

  private buildRequest(specification: Specification, inheritedFilters: GraphQlFilter[]): GraphQlEntitiesQueryRequest {
    return {
      requestType: ENTITIES_GQL_REQUEST,
      entityType: this.entityType,
      limit: 100,
      properties: [specification],
      timeRange: this.getTimeRangeOrThrow(),
      filters: inheritedFilters
    };
  }
}
