import { DataSource, dataSourceMarker, Model } from '@hypertrace/hyperdash';
import { EMPTY, Observable } from 'rxjs';
import { GraphQlFilter, GraphQlFilterable } from '../../../../graphql/model/schema/filter/graphql-filter';

@Model({
  type: 'graphql-filter-data-source'
})
export class GraphQlFilterDataSourceModel implements GraphQlFilterable, DataSource<never> {
  public readonly dataSourceMarker: typeof dataSourceMarker = dataSourceMarker;
  private readonly providedFilters: GraphQlFilter[] = [];

  public getFilters(inherited: GraphQlFilter[]): GraphQlFilter[] {
    return [...inherited, ...this.providedFilters];
  }

  public clearFilters(): this {
    this.providedFilters.length = 0;

    return this;
  }

  public getData(): Observable<never> {
    return EMPTY; // Doesn't return its own data
  }

  public addFilters(...filters: GraphQlFilter[]): this {
    this.providedFilters.push(...filters);

    return this;
  }
}
