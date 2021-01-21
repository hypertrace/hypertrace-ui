import { PrimitiveValue } from '@hypertrace/common';
import { FilterOperator, TableFilter } from '@hypertrace/components';
import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GraphQlDataSourceModel } from '../../data/graphql/graphql-data-source.model';

@Model({
  type: 'table-widget-select-filter',
  displayName: 'Select Filter'
})
export class TableWidgetSelectFilterModel extends GraphQlDataSourceModel<PrimitiveValue[]> {
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

  public getData(): Observable<PrimitiveValue[]> {
    return this.api.getData<PrimitiveValue[]>().pipe(
      map(values => values.filter(value => !this.isEmpty(value))),
      map(values => values.sort())
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
