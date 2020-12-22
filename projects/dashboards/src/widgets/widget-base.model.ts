import { ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';

export abstract class WidgetBaseModel {
  /*
   * ID must be globally unique.
   *
   * This ID may be used to identify browser storage, so a recommended but optional format could be:
   *    <page>.<table-name> (e.g. "explorer.spans-table")
   *
   * Note that we should never inspect or parse the ID. The format above is strictly for easy human identification.
   */
  @ModelProperty({
    key: 'id',
    displayName: 'Model ID',
    type: STRING_PROPERTY.type
  })
  public id?: string;
}
