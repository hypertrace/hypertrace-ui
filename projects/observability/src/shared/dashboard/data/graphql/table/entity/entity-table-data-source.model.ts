import { TableDataRequest, TableDataResponse, TableRow } from '@hypertrace/components';
import { EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import {
  GraphQlFilter,
  Specification,
  SpecificationBackedTableColumnDef,
  TableDataSourceModel
} from '@hypertrace/distributed-tracing';
import { ARRAY_PROPERTY, Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
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

  @ModelProperty({
    key: 'additional-child-specifications',
    displayName: 'Value',
    required: false,
    type: ARRAY_PROPERTY.type
  })
  public additionalChildSpecifications: Specification[] = [];

  @ModelProperty({
    key: 'flattenedFilters',
    type: ARRAY_PROPERTY.type
  })
  public flattenedFilters: GraphQlFilter[] = [];

  public getScope(): string {
    return this.entityType; // TODO: How to deal with children
  }

  protected getSearchFilterAttribute(): string {
    return 'name';
  }

  protected buildGraphQlRequest(
    filters: GraphQlFilter[],
    request: TableDataRequest<SpecificationBackedTableColumnDef>
  ): EntityTableGraphQlRequest {
    if (this.flattenedFilters.length > 0) {
      return this.buildFlattenedEntityRequest(filters, request);
    }

    return this.buildEntityRequest(filters, request);
  }

  private buildEntityRequest(
    filters: GraphQlFilter[],
    request: TableDataRequest<SpecificationBackedTableColumnDef>
  ): EntityTableGraphQlRequest {
    return {
      requestType: ENTITIES_GQL_REQUEST,
      tableRequestType: 'root',
      tableRequest: request,
      entityType: this.entityType,
      properties: request.columns.map(c => c.specification),
      limit: this.limit !== undefined ? this.limit : request.position.limit * 10, // Prefetch 10 pages
      offset: request.position.startIndex,
      sort: request.sort && {
        direction: request.sort.direction,
        key: request.columns.includes(request.sort.column)
          ? request.sort.column.specification
          : request.columns[0].specification
      },
      filters: [...filters, ...this.toGraphQlFilters(request.filters)],
      timeRange: this.getTimeRangeOrThrow(),
      includeTotal: true
    };
  }

  private buildFlattenedEntityRequest(
    filters: GraphQlFilter[],
    request: TableDataRequest<SpecificationBackedTableColumnDef>
  ): EntityTableGraphQlRequest {
    return {
      requestType: ENTITIES_GQL_REQUEST,
      tableRequestType: 'root',
      tableRequest: request,
      entityType: this.childEntityType!,
      properties: request.columns.map(column => column.specification),
      limit: this.limit !== undefined ? this.limit : request.position.limit * 10, // Prefetch 10 pages
      offset: request.position.startIndex,
      sort: request.sort && {
        direction: request.sort.direction,
        key: request.sort.column.specification
      },
      filters: [...filters, ...this.toGraphQlFilters(request.filters), ...this.flattenedFilters],
      timeRange: this.getTimeRangeOrThrow(),
      includeTotal: true
    };
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
      properties: request.columns.map(column => column.specification).concat(...this.additionalChildSpecifications),
      limit: 100, // Really no limit, putting one in for sanity
      sort: request.sort && {
        direction: request.sort.direction,
        key: request.sort.column.specification
      },
      filters: [GraphQlEntityFilter.forEntity(entity)],
      timeRange: this.getTimeRangeOrThrow()
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

  private queryEntityChildren(
    entity: Entity,
    request: TableDataRequest<SpecificationBackedTableColumnDef>
  ): Observable<TableRow[]> {
    return this.query<EntitiesGraphQlQueryHandlerService>(this.buildChildEntityRequest(request, entity)).pipe(
      map(response => this.resultsAsTreeRows(response.results, request, false))
    );
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
}

interface EntityTableGraphQlRequest extends GraphQlEntitiesQueryRequest {
  tableRequestType: 'root' | 'children';
  tableRequest: TableDataRequest;
}
