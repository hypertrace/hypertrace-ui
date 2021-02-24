import { TableControlOption, TableControlOptionType } from '@hypertrace/components';
import { BOOLEAN_PROPERTY, ModelApi, ModelProperty } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { uniqWith } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export abstract class TableWidgetControlModel {
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

  @ModelProperty({
    key: 'visible',
    displayName: 'Visible',
    type: BOOLEAN_PROPERTY.type,
    required: false
  })
  public visible: boolean = true;

  @ModelInject(MODEL_API)
  protected readonly api!: ModelApi;

  public getOptions(): Observable<LabeledTableControlOption[]> {
    return this.api.getData<LabeledTableControlOption[]>().pipe(
      map(options => (this.uniqueValues ? this.filterUniqueValues(options) : options)),
      map(options => (this.sort ? this.applySort(options) : options))
    );
  }

  private filterUniqueValues(options: LabeledTableControlOption[]): LabeledTableControlOption[] {
    return uniqWith(options, (a, b) => a.value === b.value);
  }

  private applySort(options: LabeledTableControlOption[]): LabeledTableControlOption[] {
    return options.sort((a, b) => {
      // Unset option always at the top
      if (a.type === TableControlOptionType.UnsetFilter) {
        return -1;
      }
      if (b.type === TableControlOptionType.UnsetFilter) {
        return 1;
      }

      // Sort undefined labels to the bottom
      return a.label === undefined ? 1 : b.label === undefined ? -1 : a.label.localeCompare(b.label);
    });
  }
}

export type LabeledTableControlOption = TableControlOption & {
  label: string | undefined;
};
