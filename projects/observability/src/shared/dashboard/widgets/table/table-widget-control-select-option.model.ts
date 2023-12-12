import { TableControlOption, TableControlOptionType, TableSelectControlOption } from '@hypertrace/components';
import { ARRAY_PROPERTY, Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TableWidgetControlModel } from './table-widget-control.model';
import { isEmpty, isEqual } from 'lodash-es';

@Model({
  type: 'table-widget-select-option',
})
export class TableWidgetControlSelectOptionModel extends TableWidgetControlModel<TableSelectControlOption> {
  public readonly isMultiselect: boolean = false;

  @ModelProperty({
    key: 'placeholder',
    displayName: 'Placeholder',
    type: STRING_PROPERTY.type,
    required: true,
  })
  public placeholder!: string;

  @ModelProperty({
    key: 'selected',
    displayName: 'Selected',
    type: ARRAY_PROPERTY.type,
    required: false,
  })
  public selected: TableSelectControlOption[] = [];

  public getOptions(): Observable<TableSelectControlOption[]> {
    return super.getOptions().pipe(
      map(options => {
        if (!this.isValidSelectControlOptions(options)) {
          throw Error(`Invalid table widget select data source for options '${JSON.stringify(options)}'`);
        }

        return options;
      }),
      map(options =>
        isEmpty(this.selected)
          ? options
          : options.map(option => (this.isOptionSelected(option) ? { ...option, applied: true } : option)),
      ),
    );
  }

  private isOptionSelected(option: TableSelectControlOption): boolean {
    return this.selected.findIndex(selectedOption => isEqual(option, selectedOption)) > -1;
  }

  private isValidSelectControlOptions(options: TableControlOption[]): options is TableSelectControlOption[] {
    return options.every(option => option.type === TableControlOptionType.Filter);
  }
}
