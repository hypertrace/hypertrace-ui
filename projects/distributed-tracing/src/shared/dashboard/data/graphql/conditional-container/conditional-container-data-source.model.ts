import { Observable } from 'rxjs';
import { GraphQlDataSourceModel } from '../graphql-data-source.model';

export abstract class ConditionalContainerDataSourceModel extends GraphQlDataSourceModel<boolean> {
  public abstract getData(): Observable<boolean>;
}
