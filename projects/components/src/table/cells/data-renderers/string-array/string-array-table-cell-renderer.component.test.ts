import { TableCellNoOpParser } from '@hypertrace/components';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { tableCellDataProvider, tableCellProviders } from '../../test/cell-providers';
import { StringArrayTableCellRendererComponent } from './string-array-table-cell-renderer.component';

describe('String array table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: StringArrayTableCellRendererComponent,
    providers: [
      tableCellProviders(
        {
          id: 'test'
        },
        new TableCellNoOpParser(undefined!)
      )
    ],

    shallow: true
  });

  test('should render an array with one item as expected', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider(['first-item'])]
    });

    expect(spectator.query('.first-item')).toHaveText('first-item');
    expect(spectator.query('.summary-text')).toHaveText('');
  });

  test('should render an empty array as expected', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider([])]
    });

    expect(spectator.query('.first-item')).toHaveText('-');
    expect(spectator.query('.summary-text')).toHaveText('');
  });

  test('should render array with multiple items as expected', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider(['first-item', 'second-item', 'third-item'])]
    });

    expect(spectator.query('.first-item')).toHaveText('first-item');
    expect(spectator.query('.summary-text')).toHaveText('+2');
  });
});
