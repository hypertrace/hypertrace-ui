import { TableControlOption, TableControlOptionType } from '@hypertrace/components';
import { BOOLEAN_PROPERTY, ModelApi, ModelProperty } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { uniqWith } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export abstract class TableWidgetControlModelBase {
  @ModelProperty({
    key: 'sort',
    type: BOOLEAN_PROPERTY.type
  })
  public sort: boolean = true;

  @ModelProperty({
    key: 'unique-values',
    type: BOOLEAN_PROPERTY.type
  })
  public uniqueValues: boolean = false;

  @ModelInject(MODEL_API)
  protected readonly api!: ModelApi;

  public getOptions(): Observable<TableControlOption[]> {
    return this.api.getData<TableControlOption[]>().pipe(
      map((options: TableControlOption[]) => (this.uniqueValues ? this.filterUniqueValues(options) : options)),
      map((options: TableControlOption[]) => (this.sort ? this.applySort(options) : options))
    );
  }

  private filterUniqueValues(options: TableControlOption[]): TableControlOption[] {
    return uniqWith(options, (a: TableControlOption, b: TableControlOption) => a.value === b.value);
  }

  private applySort(options: TableControlOption[]): TableControlOption[] {
    return options.sort((a: TableControlOption, b: TableControlOption) => {
      // Unset option always at the top
      if (a.type === TableControlOptionType.Unset) {
        return -1;
      }
      if (b.type === TableControlOptionType.Unset) {
        return 1;
      }

      return a.label.localeCompare(b.label);
    });
  }
}
