import { FilterOperator, TableControlOptionType, TableSelectControlOption } from '@hypertrace/components';
import { Model } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntitiesAttributeDataSourceModel } from './entities-attribute-data-source.model';

@Model({
  type: 'entities-attribute-options-data-source'
})
export class EntitiesAttributeOptionsDataSourceModel extends EntitiesAttributeDataSourceModel {
  public getData(): Observable<TableSelectControlOption[]> {
    return super.getData().pipe(
      map((values: unknown[]) =>
        values.map(value => ({
          type: TableControlOptionType.Filter as const,
          label: String(value),
          metaValue: {
            field: this.specification.name,
            operator: FilterOperator.Equals,
            value: value
          }
        }))
      )
    );
  }
}
