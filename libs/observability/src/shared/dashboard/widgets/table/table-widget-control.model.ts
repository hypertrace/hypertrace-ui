import { TableControlOption, TableControlOptionType } from '@hypertrace/components';
import { BOOLEAN_PROPERTY, ModelApi, ModelProperty } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { uniqWith } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export abstract class TableWidgetControlModel<T extends TableControlOption> {
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

  public getOptions(): Observable<T[]> {
    return this.api.getData<T[]>().pipe(
      map(options => (this.uniqueValues ? this.filterUnique(options) : options)),
      map(options => (this.sort ? this.applySort(options) : options))
    );
  }

  protected filterUnique(options: T[]): T[] {
    return uniqWith(options, (a, b) => a.label === b.label);
  }

  protected applySort(options: T[]): T[] {
    return options.sort((a, b) => {
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
