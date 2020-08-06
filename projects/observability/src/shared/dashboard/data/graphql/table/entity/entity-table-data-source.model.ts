import { TableDataRequest, TableDataResponse, TableRow } from '@hypertrace/components';
import { EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import {
  GraphQlFilter,
  SpecificationBackedTableColumnDef,
  TableDataSourceModel
} from '@hypertrace/distributed-tracing';
import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Entity, EntityType, ObservabilityEntityType } from '../../../../../graphql/model/schema/entity';
import { GraphQlEntityFilter } from '../../../../../graphql/model/schema/filter/entity/graphql-entity-filter';
import { EntitiesResponse } from '../../../../../graphql/request/handlers/entities/query/entities-graphql-query-builder.service';
import {
  EntitiesGraphQlQueryHandlerService,
  ENTITIES_GQL_REQUEST,
  GraphQlEntitiesQueryRequest
} from '../../../../../graphql/request/handlers/entities/query/entities-graphql-query-handler.service';

@Model({
  type: 'entity-table-data-source'
})
export class EntityTableDataSourceModel extends TableDataSourceModel {
  @ModelProperty({
    key: 'entity',
    required: true,
    type: STRING_PROPERTY.type
  })
  public entityType!: EntityType;

  @ModelProperty({
    key: 'childEntity',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [ObservabilityEntityType.Api]
    } as EnumPropertyTypeInstance
  })
  public childEntityType?: ObservabilityEntityType;

  protected buildGraphQlRequest(
    filters: GraphQlFilter[],
    request: TableDataRequest<SpecificationBackedTableColumnDef>
  ): EntityTableGraphQlRequest {
    return {
      requestType: ENTITIES_GQL_REQUEST,
      tableRequestType: 'root',
      tableRequest: request,
      entityType: this.entityType,
      properties: request.columns.map(column => column.specification),
      limit: this.limit !== undefined ? this.limit : request.position.limit * 4, // Prefetch 4 pages
      offset: request.position.startIndex,
      sort: request.sort && {
        direction: request.sort.direction,
        key: request.sort.column.specification
      },
      filters: [...filters, ...this.buildSearchFilters(request)],
      timeRange: this.getTimeRangeOrThrow(),
      includeTotal: true
    };
  }

  protected buildTableResponse(
    response: EntitiesResponse,
    request: TableDataRequest<SpecificationBackedTableColumnDef>
  ): TableDataResponse<TableRow> {
    return {
      data: this.resultsAsTreeRows(response.results, request, this.childEntityType !== undefined),
      totalCount: response.total!
    };
  }

  protected getSearchFilterAttribute(): string {
    return 'name';
  }

  private buildChildEntityRequest(
    request: TableDataRequest<SpecificationBackedTableColumnDef>,
    entity: Entity
  ): EntityTableGraphQlRequest {
    return {
      requestType: ENTITIES_GQL_REQUEST,
      tableRequestType: 'children',
      tableRequest: request,
      entityType: this.childEntityType!,
      properties: request.columns.map(column => column.specification),
      limit: 100, // Really no limit, putting one in for sanity
      sort: request.sort && {
        direction: request.sort.direction,
        key: request.sort.column.specification
      },
      filters: [GraphQlEntityFilter.forEntity(entity)],
      timeRange: this.getTimeRangeOrThrow()
    };
  }

  private resultsAsTreeRows(
    results: Entity[],
    request: TableDataRequest<SpecificationBackedTableColumnDef>,
    expandable: boolean
  ): TableRow[] {
    return results.map(entity => ({
      ...entity,
      getChildren: () => (expandable ? this.queryEntityChildren(entity, request) : EMPTY),
      isExpandable: () => expandable
    }));
  }

  private queryEntityChildren(
    entity: Entity,
    request: TableDataRequest<SpecificationBackedTableColumnDef>
  ): Observable<TableRow[]> {
    return this.queryWithNextBatch<EntitiesGraphQlQueryHandlerService>(
      this.buildChildEntityRequest(request, entity)
    ).pipe(map(response => this.resultsAsTreeRows(response.results, request, false)));
  }
}

interface EntityTableGraphQlRequest extends GraphQlEntitiesQueryRequest {
  tableRequestType: 'root' | 'children';
  tableRequest: TableDataRequest;
}
