import {
  ClientSideSort,
  TableDataRequest,
  TableDataResponse,
  TableDataSource,
  TableFilter,
  TableRow
} from '@hypertrace/components';
import { GraphQlRequestOptions } from '@hypertrace/graphql-client';
import { BOOLEAN_PROPERTY, ModelProperty, NUMBER_PROPERTY, UNKNOWN_PROPERTY } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable, of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';
import { GraphQlFilter } from '../../../../graphql/model/schema/filter/graphql-filter';
import { GraphQlFilterBuilderService } from '../../../../services/filter-builder/graphql-filter-builder.service';
import { SpecificationBackedTableColumnDef } from '../../../widgets/table/table-widget-column.model';
import { GraphQlDataSourceModel } from '../graphql-data-source.model';

export abstract class TableDataSourceModel extends GraphQlDataSourceModel<TableDataSource<TableRow>> {
  @ModelInject(GraphQlFilterBuilderService)
  public graphQlFilterBuilderService!: GraphQlFilterBuilderService;

  @ModelProperty({
    key: 'limit',
    displayName: 'Query Limit',
    type: NUMBER_PROPERTY.type
  })
  public limit?: number;

  @ModelProperty({
    key: 'isClientSideFiltered',
    displayName: 'Client Side Filtered',
    type: BOOLEAN_PROPERTY.type
  })
  public isClientSideFiltered?: boolean;

  @ModelProperty({
    key: 'clientSideSort',
    displayName: 'Client Side Sort',
    type: UNKNOWN_PROPERTY.type
  })
  public clientSideSort?: ClientSideSort;

  public getData(): Observable<TableDataSource<TableRow, SpecificationBackedTableColumnDef>> {
    return observableOf({
      getData: request =>
        this.query(filters => this.buildGraphQlRequest(filters, request), this.buildGraphqlRequestOptions()).pipe(
          map(response => this.buildTableResponse(response, request))
        ),
      getScope: () => this.getScope()
    });
  }

  protected buildGraphqlRequestOptions(): GraphQlRequestOptions | undefined {
    return undefined;
  }

  public abstract getScope(): string | undefined;

  protected abstract buildGraphQlRequest(
    inheritedFilters: GraphQlFilter[],
    request: TableDataRequest<SpecificationBackedTableColumnDef>
  ): unknown;

  protected abstract buildTableResponse(
    response: unknown,
    request: TableDataRequest<SpecificationBackedTableColumnDef>
  ): TableDataResponse<TableRow>;

  protected toGraphQlFilters(tableFilters: TableFilter[] = []): GraphQlFilter[] {
    return this.graphQlFilterBuilderService.buildGraphQlFiltersFromTableFilters(tableFilters);
  }
}
