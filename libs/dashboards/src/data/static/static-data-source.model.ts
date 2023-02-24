import { DataSource, dataSourceMarker, Model, ModelProperty, UNKNOWN_PROPERTY } from '@hypertrace/hyperdash';
import { Observable, of } from 'rxjs';

@Model({
  type: 'static-data-source'
})
export class StaticDataSource<T> implements DataSource<T> {
  public readonly dataSourceMarker: typeof dataSourceMarker = dataSourceMarker;

  @ModelProperty({
    key: 'value',
    type: UNKNOWN_PROPERTY.type
  })
  public value!: T;

  public getData(): Observable<T> {
    return of(this.value);
  }
}
