import { FormattingModule } from '@hypertrace/common';
import { byText, createComponentFactory } from '@ngneat/spectator/jest';
import { TableCellNumberParser } from '../../data-parsers/table-cell-number-parser';
import { tableCellColumnProvider, tableCellDataProvider, tableCellProviders } from '../../test/cell-providers';
import { NumericTableCellRendererComponent } from './numeric-table-cell-renderer.component';

describe('Numeric table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: NumericTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      ...tableCellProviders(
        {
          id: 'test'
        },
        new TableCellNumberParser(undefined!)
      )
    ],
    shallow: true
  });

  test('should render a plain number', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider(36)]
    });

    expect(spectator.element).toHaveText('36');
  });

  test('should render a missing number', () => {
    const spectator = buildComponent();

    expect(spectator.element).toHaveText('-');
  });

  test('should add clickable class for clickable columns', () => {
    const spectator = buildComponent({
      providers: [
        tableCellColumnProvider({
          id: 'test',
          onClick: () => {
            /* NOOP */
          }
        }),
        tableCellDataProvider(42)
      ]
    });

    expect(spectator.query(byText('42'))).toHaveClass('clickable');
  });

  test('should not add clickable class for columns without a click handler', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider(22)]
    });

    expect(spectator.query(byText('22'))).not.toHaveClass('clickable');
  });
});
