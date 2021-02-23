import { TableControlOption } from '@hypertrace/components';
import { Observable } from 'rxjs';
import { GraphQlDataSourceModel } from './graphql-data-source.model';

export abstract class GraphqlTableControlOptionsDataSourceModel
  extends GraphQlDataSourceModel<TableControlOption[]> {
  public abstract getData(): Observable<TableControlOption[]>;
}
