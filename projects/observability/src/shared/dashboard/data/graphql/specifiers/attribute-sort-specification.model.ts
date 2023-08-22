import { Dictionary } from '@hypertrace/common';
import { TableSortDirection } from '@hypertrace/components';
import { ENUM_TYPE, EnumPropertyTypeInstance } from '@hypertrace/dashboards';
import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { Specification } from '../../../../graphql/model/schema/specifier/specification';
import { SpecificationBuilder } from '../../../../graphql/request/builders/specification/specification-builder';
import { SpecificationModel } from './specification.model';

@Model({
  type: 'attribute-sort-specification',
  displayName: 'Attribute Sort'
})
export class AttributeSortSpecificationModel extends SpecificationModel<Specification> {
  @ModelProperty({
    key: 'key',
    type: STRING_PROPERTY.type,
    required: true
  })
  public key!: string;

  @ModelProperty({
    key: 'direction',
    type: {
      key: ENUM_TYPE.type,
      values: [TableSortDirection.Ascending, TableSortDirection.Descending]
    } as EnumPropertyTypeInstance
  })
  public direction!: TableSortDirection;

  protected buildInnerSpec(): Specification {
    return new SpecificationBuilder().attributeSpecificationForKey(this.key);
  }

  public extractFromServerData(resultContainer: Dictionary<unknown>): unknown {
    return this.innerSpec.extractFromServerData(resultContainer);
  }
}
