import {
  FilterOperator,
  TableControlOptionType,
  TableFilterControlOption,
  TableUnsetFilterControlOption
} from '@hypertrace/components';
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

  private buildUnsetOption(attribute: string): Labeled<TableUnsetFilterControlOption> {
    return {
      type: TableControlOptionType.UnsetFilter,
      label: this.unsetLabel,
      metaValue: attribute
    };
  }

  public getData(): Observable<(Labeled<TableUnsetFilterControlOption> | Labeled<TableFilterControlOption>)[]> {
    return super.getData().pipe(
      map((values: unknown[]) => [
        this.buildUnsetOption(this.specification.name),
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

type Labeled<T> = T & { label: string };
