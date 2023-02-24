import { TableControlOption, TableControlOptionType, TableSelectControlOption } from '@hypertrace/components';
import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TableWidgetControlModel } from './table-widget-control.model';

@Model({
  type: 'table-widget-select-option'
})
export class TableWidgetControlSelectOptionModel extends TableWidgetControlModel<TableSelectControlOption> {
  public readonly isMultiselect: boolean = false;

  @ModelProperty({
    key: 'placeholder',
    displayName: 'Placeholder',
    type: STRING_PROPERTY.type,
    required: true
  })
  public placeholder!: string;

  public getOptions(): Observable<TableSelectControlOption[]> {
    return super.getOptions().pipe(
      map(options => {
        if (!this.isValidSelectControlOptions(options)) {
          throw Error(`Invalid table widget select data source for options '${JSON.stringify(options)}'`);
        }

        return options;
      })
    );
  }

  private isValidSelectControlOptions(options: TableControlOption[]): options is TableSelectControlOption[] {
    return options.every(option => option.type === TableControlOptionType.Filter);
  }
}
