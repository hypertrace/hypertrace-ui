import { TableDataRequest, TableDataResponse, TableDataSource, TableMode, TableRow } from '@hypertrace/components';
import { ModelProperty, NUMBER_PROPERTY } from '@hypertrace/hyperdash';
import { isEmpty } from 'lodash-es';
import { Observable, of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';
import { GraphQlFieldFilter } from '../../../../../shared/graphql/model/schema/filter/field/graphql-field-filter';
import { GraphQlFilter, GraphQlOperatorType } from '../../../../../shared/graphql/model/schema/filter/graphql-filter';
import { SpecificationBackedTableColumnDef } from '../../../widgets/table/table-widget-column.model';
import { GraphQlDataSourceModel } from '../graphql-data-source.model';

export abstract class TableDataSourceModel extends GraphQlDataSourceModel<TableDataSource<TableRow>> {
  @ModelProperty({
    key: 'limit',
    displayName: 'Query Limit',
    type: NUMBER_PROPERTY.type
  })
  public limit?: number;

  public getData(): Observable<TableDataSource<TableRow, SpecificationBackedTableColumnDef>> {
    return observableOf({
      getData: (request, mode) =>
        this.query(filters => this.buildGraphQlRequest(filters, request, mode)).pipe(
          map(response => this.buildTableResponse(response, request, mode))
        ),
      getScope: () => this.getScope()
    });
  }

  public abstract getScope(): string | undefined;

  protected abstract buildGraphQlRequest(
    inheritedFilters: GraphQlFilter[],
    request: TableDataRequest<SpecificationBackedTableColumnDef>,
    mode?: TableMode
  ): unknown;

  protected abstract buildTableResponse(
    response: unknown,
    request: TableDataRequest<SpecificationBackedTableColumnDef>,
    mode?: TableMode
  ): TableDataResponse<TableRow>;

  protected abstract getSearchFilterAttribute(request: TableDataRequest<SpecificationBackedTableColumnDef>): string;

  protected buildSearchFilters(request: TableDataRequest<SpecificationBackedTableColumnDef>): GraphQlFilter[] {
    if (isEmpty(request.filter)) {
      return [];
    }

    return [new GraphQlFieldFilter(this.getSearchFilterAttribute(request), GraphQlOperatorType.Like, request.filter!)];
  }
}
