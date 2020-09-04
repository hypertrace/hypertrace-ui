import { CoreTableCellRendererType } from '@hypertrace/components';
import { SpecificationBuilder } from '../../../graphql/request/builders/specification/specification-builder';
import { TableWidgetColumnModel } from './table-widget-column.model';

describe('Table widget column model', () => {
  const buildModel = (partial: Partial<TableWidgetColumnModel>) => {
    const model = new TableWidgetColumnModel();
    Object.assign(model, partial);

    return model;
  };
  const specBuilder = new SpecificationBuilder();

  test('builds a column def for an attribute specification', () => {
    const model = buildModel({
      value: specBuilder.attributeSpecificationForKey('name'),
      title: 'Name column',
      display: CoreTableCellRendererType.Text
    });

    const columnDef = model.asTableColumnDef();
    expect(columnDef).toEqual(
      expect.objectContaining({
        id: 'name',
        title: 'Name column',
        display: CoreTableCellRendererType.Text
      })
    );
  });
});
