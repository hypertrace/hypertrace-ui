import { LabeledTableControlOption } from '@hypertrace/components';
import { Observable } from 'rxjs';
import { GraphQlDataSourceModel } from './graphql-data-source.model';

export abstract class GraphqlTableControlOptionsDataSourceModel extends GraphQlDataSourceModel<LabeledTableControlOption[]> {
  public abstract getData(): Observable<LabeledTableControlOption[]>;
}
