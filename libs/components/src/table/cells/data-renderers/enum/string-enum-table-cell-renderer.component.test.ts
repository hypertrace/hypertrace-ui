import { FormattingModule } from '@hypertrace/common';
import { byText, createComponentFactory } from '@ngneat/spectator/jest';
import { TableCellStringParser } from '../../data-parsers/table-cell-string-parser';
import { tableCellColumnProvider, tableCellDataProvider, tableCellProviders } from '../../test/cell-providers';
import { StringEnumTableCellRendererComponent } from './string-enum-table-cell-renderer.component';

describe('String Enum table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: StringEnumTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      tableCellProviders(
        {
          id: 'test'
        },
        new TableCellStringParser(undefined!)
      )
    ],
    shallow: true
  });

  test('should render a plain string', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider('test-text')]
    });

    expect(spectator.element).toHaveText('Test text');
  });

  test('should render a missing string', () => {
    const spectator = buildComponent();

    expect(spectator.element).toHaveText('');
  });

  test('should add clickable class for clickable columns', () => {
    const spectator = buildComponent({
      providers: [
        tableCellDataProvider('test-text'),
        tableCellColumnProvider({
          id: 'test',
          onClick: () => {
            /* NOOP */
          }
        })
      ]
    });

    expect(spectator.query(byText('Test text'))).toHaveClass('clickable');
  });

  test('should not add clickable class for columns without a click handler', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider('TEST_TEXT')]
    });

    expect(spectator.query(byText('Test text'))).not.toHaveClass('clickable');
  });
});
