import { FilterOperator, TableControlOptionType } from '@hypertrace/components';
import { LabeledTableControlOption } from '@hypertrace/distributed-tracing';
import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntitiesAttributeDataSourceModel } from './entities-attribute-data-source.model';

@Model({
  type: 'entities-attribute-options-data-source'
})
export class EntitiesAttributeOptionsDataSourceModel extends EntitiesAttributeDataSourceModel {
  @ModelProperty({
    key: 'unset-label',
    type: STRING_PROPERTY.type,
    required: true
  })
  public unsetLabel: string = 'All';

  public getData(): Observable<LabeledTableControlOption[]> {
    return super.getData().pipe(
      map((values: unknown[]) => [
        {
          type: TableControlOptionType.UnsetFilter,
          label: this.unsetLabel,
          metaValue: this.specification.name
        },
        ...values.map(value => ({
          type: TableControlOptionType.Filter as const,
          label: String(value),
          value: value,
          metaValue: {
            field: this.specification.name,
            operator: FilterOperator.Equals,
            value: value
          }
        }))
      ])
    );
  }
}
