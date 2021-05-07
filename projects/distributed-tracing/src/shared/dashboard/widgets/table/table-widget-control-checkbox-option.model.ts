import { hasOwnProperty } from '@hypertrace/common';
import { TableCheckboxControlOption, TableCheckboxOptions, TableControlOption } from '@hypertrace/components';
import { BOOLEAN_PROPERTY, Model, ModelProperty } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TableWidgetControlModel } from './table-widget-control.model';

@Model({
  type: 'table-widget-checkbox-option'
})
export class TableWidgetControlCheckboxOptionModel extends TableWidgetControlModel<TableCheckboxControlOption> {
  @ModelProperty({
    key: 'checked',
    displayName: 'Checked',
    type: BOOLEAN_PROPERTY.type,
    required: false
  })
  public checked: boolean = false;

  public getOptions(): Observable<TableCheckboxOptions> {
    return super.getOptions().pipe(
      map(options => {
        if (!this.isValidCheckboxControlOptions(options)) {
          throw Error(`Invalid table widget checkbox data source for options '${JSON.stringify(options)}'`);
        }

        return [
          options[0], // True
          options[1] // False
        ];
      })
    );
  }

  private isValidCheckboxControlOptions(options: TableControlOption[]): options is TableCheckboxOptions {
    return (
      options.length === 2 &&
      options.every(option => hasOwnProperty(option, 'value') && typeof option.value === 'boolean')
    );
  }
}
