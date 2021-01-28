import { PrimitiveValue } from '@hypertrace/common';
import { FilterOperator, TableFilter } from '@hypertrace/components';
import { BOOLEAN_PROPERTY, Model, ModelApi, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Model({
  type: 'table-widget-select-filter',
  displayName: 'Select Filter'
})
export class TableWidgetSelectFilterModel {
  @ModelProperty({
    key: 'attribute',
    type: STRING_PROPERTY.type,
    required: true
  })
  public attribute!: string;

  @ModelProperty({
    key: 'unset-option',
    type: STRING_PROPERTY.type
  })
  public unsetOption?: string;

  @ModelProperty({
    key: 'sort',
    type: BOOLEAN_PROPERTY.type
  })
  public sort: boolean = true;

  @ModelInject(MODEL_API)
  protected readonly api!: ModelApi;

  public getData(): Observable<PrimitiveValue[]> {
    return this.api.getData<PrimitiveValue[]>().pipe(
      map(values => values.filter(value => !this.isEmpty(value))),
      map(values => (this.sort ? values.sort() : values))
    );
  }

  public isEmpty(value: unknown): boolean {
    // Empty values can't be queried through filtering yet, so need to remove them so they don't appear in the dropdown
    return value === undefined || value === null || value === '';
  }

  public getTableFilter(value: unknown): TableFilter {
    return {
      field: this.attribute,
      operator: FilterOperator.Equals,
      value: value
    };
  }
}
