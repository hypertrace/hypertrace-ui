import {
  TableDataRequest,
  TableDataResponse,
  TableDataSource,
  TableFilter,
  TableMode,
  TableRow
} from '@hypertrace/components';
import { GraphQlArgumentValue } from '@hypertrace/graphql-client';
import { ModelProperty, NUMBER_PROPERTY } from '@hypertrace/hyperdash';
import { Observable, of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';
import { GraphQlFilter } from '../../../../../shared/graphql/model/schema/filter/graphql-filter';
import { GraphQlFieldFilter } from '../../../../graphql/model/schema/filter/field/graphql-field-filter';
import { toGraphQlOperator } from '../../../../services/filter-builder/graphql-filter-builder.service';
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

  protected toGraphQlFilters(tableFilters: TableFilter[] = []): GraphQlFilter[] {
    return tableFilters.map(
      filter =>
        new GraphQlFieldFilter(filter.field, toGraphQlOperator(filter.operator), filter.value as GraphQlArgumentValue)
    );
  }
}
