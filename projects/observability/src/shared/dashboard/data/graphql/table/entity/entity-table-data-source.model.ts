import { TableDataRequest, TableDataResponse, TableRow } from '@hypertrace/components';
import {
  ARRAY_PROPERTY,
  Model,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Entity, EntityType } from '../../../../../graphql/model/schema/entity';
import { GraphQlEntityFilter } from '../../../../../graphql/model/schema/filter/entity/graphql-entity-filter';
import { GraphQlFilter } from '../../../../../graphql/model/schema/filter/graphql-filter';
import { Specification } from '../../../../../graphql/model/schema/specifier/specification';
import { EntitiesResponse } from '../../../../../graphql/request/handlers/entities/query/entities-graphql-query-builder.service';
import {
  ENTITIES_GQL_REQUEST,
  GraphQlEntitiesQueryRequest
} from '../../../../../graphql/request/handlers/entities/query/entities-graphql-query-handler.service';
import { SpecificationBackedTableColumnDef } from '../../../../widgets/table/table-widget-column.model';
import { TableDataSourceModel } from '../table-data-source.model';

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
    key: 'child-data-source',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: EntityTableDataSourceModel
    } as ModelModelPropertyTypeInstance,
    required: false
  })
  public childEntityDataSource?: EntityTableDataSourceModel;

  @ModelProperty({
    key: 'additional-specifications',
    displayName: 'Additional Specifications',
    required: false,
    type: ARRAY_PROPERTY.type
  })
  public additionalSpecifications: Specification[] = [];

  public getScope(): string {
    return this.entityType;
  }

  protected buildGraphQlRequest(
    filters: GraphQlFilter[],
    request: TableDataRequest<SpecificationBackedTableColumnDef>
  ): GraphQlEntitiesQueryRequest {
    return {
      requestType: ENTITIES_GQL_REQUEST,
      entityType: this.entityType,
      properties: request.columns.map(column => column.specification).concat(...this.additionalSpecifications),
      limit: this.limit !== undefined ? this.limit : request.position.limit * 2, // Prefetch 2 pages
      offset: request.position.startIndex,
      sort: request.sort && {
        direction: request.sort.direction,
        key: request.sort.column.specification
      },
      filters: [...filters, ...this.toGraphQlFilters(request.filters)],
      timeRange: this.getTimeRangeOrThrow(),
      includeTotal: true,
      includeInactive: request.includeInactive
    };
  }

  protected buildTableResponse(
    response: EntitiesResponse,
    request: TableDataRequest<SpecificationBackedTableColumnDef>
  ): TableDataResponse<TableRow> {
    return {
      data: this.resultsAsTreeRows(response.results, request, this.childEntityDataSource !== undefined),
      totalCount: response.total!
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
    parentRequest: TableDataRequest<SpecificationBackedTableColumnDef>
  ): Observable<TableRow[]> {
    return this.childEntityDataSource!.getDataForParentEntity(entity, this.buildChildTableRequest(parentRequest));
  }

  private getDataForParentEntity(
    entity: Entity,
    request: TableDataRequest<SpecificationBackedTableColumnDef>
  ): Observable<TableRow[]> {
    return this.query(filters =>
      this.buildGraphQlRequest([...filters, GraphQlEntityFilter.forEntity(entity)], request)
    ).pipe(
      map(response => this.buildTableResponse(response as EntitiesResponse, request)),
      map(response => this.resultsAsTreeRows(response.data as Entity[], request, false))
    );
  }

  private buildChildTableRequest(
    parentRequest: TableDataRequest<SpecificationBackedTableColumnDef>
  ): TableDataRequest<SpecificationBackedTableColumnDef> {
    return {
      columns: parentRequest.columns,
      position: {
        startIndex: 0,
        limit: 20
      },
      sort: parentRequest.sort
    };
  }
}
