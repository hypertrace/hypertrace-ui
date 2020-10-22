import { TableDataRequest, TableDataResponse, TableRow } from '@hypertrace/components';
import { ENUM_TYPE, EnumPropertyTypeInstance } from '@hypertrace/dashboards';
import {
  GraphQlFieldFilter,
  GraphQlFilter,
  GraphQlOperatorType,
  SpecificationBackedTableColumnDef,
  TableDataSourceModel
} from '@hypertrace/distributed-tracing';
import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { EMPTY, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Entity, entityIdKey, EntityType, ObservabilityEntityType } from '../../../../../graphql/model/schema/entity';
import { GraphQlEntityFilter } from '../../../../../graphql/model/schema/filter/entity/graphql-entity-filter';
import { EntitiesResponse } from '../../../../../graphql/request/handlers/entities/query/entities-graphql-query-builder.service';
import {
  ENTITIES_GQL_REQUEST,
  EntitiesGraphQlQueryHandlerService,
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
    key: 'flattenedId',
    type: STRING_PROPERTY.type
  })
  public flattenedId?: string;

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
    return {
      requestType: ENTITIES_GQL_REQUEST,
      tableRequestType: 'root',
      tableRequest: request,
      entityType: this.entityType,
      properties: request.columns.filter(c => !c.flattenedColumn).map(c => c.specification),
      limit: this.limit !== undefined ? this.limit : request.position.limit * 10, // Prefetch 10 pages
      offset: request.position.startIndex,
      sort: request.sort && {
        direction: request.sort.direction,
        key: request.sort.column.flattenedColumn ? request.columns[0].specification : request.sort.column.specification
      },
      filters: [...filters, ...this.buildSearchFilters(request)],
      timeRange: this.getTimeRangeOrThrow(),
      includeTotal: true
    };
  }

  protected buildTableResponse(
    response: EntitiesResponse,
    request: TableDataRequest<SpecificationBackedTableColumnDef>,
    flattenedTree: boolean
  ): Observable<TableDataResponse<TableRow>> {
    if (flattenedTree) {
      return this.queryFlattenedTree(response, request).pipe(
        map(rows => this.buildTableDataResponse(rows, response.total!))
      );
    }

    return this.resultsAsTreeRows(response.results, request, this.childEntityType !== undefined).pipe(
      map(rows => this.buildTableDataResponse(rows, response.total!))
    );
  }

  private buildTableDataResponse(rows: TableRow[], total: number): TableDataResponse<TableRow> {
    return {
      data: rows,
      totalCount: total
    };
  }

  private queryFlattenedTree(
    response: EntitiesResponse,
    request: TableDataRequest<SpecificationBackedTableColumnDef>
  ): Observable<TableRow[]> {
    return this.query<EntitiesGraphQlQueryHandlerService>(this.buildFlattenedTreeRequest(response, request)).pipe(
      mergeMap(response => this.resultsAsTreeRows(response.results, request, false))
    );
  }

  private buildFlattenedTreeRequest(
    response: EntitiesResponse,
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
      filters: [this.buildFlattenedTreeFilter(response.results)],
      timeRange: this.getTimeRangeOrThrow(),
      includeTotal: true
    };
  }

  private buildFlattenedTreeFilter(entities: Entity[]): GraphQlFilter {
    return new GraphQlFieldFilter(
      this.flattenedId!,
      GraphQlOperatorType.In,
      entities.map(e => e[entityIdKey])
    );
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
  ): Observable<TableRow[]> {
    return of(
      results.map(entity => ({
        ...entity,
        getChildren: () => (expandable ? this.queryEntityChildren(entity, request) : EMPTY),
        isExpandable: () => expandable
      }))
    );
  }

  private queryEntityChildren(
    entity: Entity,
    request: TableDataRequest<SpecificationBackedTableColumnDef>
  ): Observable<TableRow[]> {
    return this.query<EntitiesGraphQlQueryHandlerService>(this.buildChildEntityRequest(request, entity)).pipe(
      mergeMap(response => this.resultsAsTreeRows(response.results, request, false))
    );
  }
}

interface EntityTableGraphQlRequest extends GraphQlEntitiesQueryRequest {
  tableRequestType: 'root' | 'children';
  tableRequest: TableDataRequest;
}
