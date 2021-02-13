import { TableControlOption } from '@hypertrace/components';
import { Observable } from 'rxjs';
import { GraphQlDataSourceModel } from './graphql-data-source.model';

export abstract class GraphqlTableControlOptionsDataSourceModel<
  TMetaValue = unknown,
  TValue = unknown
> extends GraphQlDataSourceModel<TableControlOption<TMetaValue, TValue>[]> {
  public abstract getData(): Observable<TableControlOption<TMetaValue, TValue>[]>;
}
