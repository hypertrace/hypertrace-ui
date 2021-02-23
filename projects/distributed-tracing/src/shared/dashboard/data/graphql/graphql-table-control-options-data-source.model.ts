import { Observable } from 'rxjs';
import { LabeledTableControlOption } from '../../widgets/table/table-widget-control.model';
import { GraphQlDataSourceModel } from './graphql-data-source.model';

export abstract class GraphqlTableControlOptionsDataSourceModel extends GraphQlDataSourceModel<
  LabeledTableControlOption[]
> {
  public abstract getData(): Observable<LabeledTableControlOption[]>;
}
