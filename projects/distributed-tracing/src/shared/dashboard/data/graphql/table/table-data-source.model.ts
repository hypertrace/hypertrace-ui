import { TableDataRequest, TableDataResponse, TableDataSource, TableRow } from '@hypertrace/components';
import { ModelProperty, NUMBER_PROPERTY } from '@hypertrace/hyperdash';
import { Observable, of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';
import { GraphQlFilter } from '../../../../../shared/graphql/model/schema/filter/graphql-filter';
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
      getData: request =>
        this.query(filters => this.buildGraphQlRequest(filters, request)).pipe(
          map(response => this.buildTableResponse(response, request))
        ),
      getScope: () => this.getScope()
    });
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
}
