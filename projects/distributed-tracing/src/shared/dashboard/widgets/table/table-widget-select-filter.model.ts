import { PrimitiveValue } from '@hypertrace/common';
import { FilterOperator, TableFilter } from '@hypertrace/components';
import { Model, ModelApi, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';

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

  @ModelInject(MODEL_API)
  protected readonly api!: ModelApi;

  public getData(): Observable<PrimitiveValue[]> {
    return this.api.getData<PrimitiveValue[]>();
  }

  public getTableFilter(value: unknown): TableFilter {
    return {
      field: this.attribute,
      operator: FilterOperator.Equals,
      value: value
    };
  }
}
