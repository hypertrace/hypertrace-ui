import { FormattingModule } from '@hypertrace/common';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { TableCellStringParser } from '../../data-parsers/table-cell-string-parser';
import { tableCellDataProvider, tableCellProviders } from '../../test/cell-providers';
import { MultilineTextTableCellRendererComponent } from './multiline-text-table-cell-renderer.component';

describe('Text table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: MultilineTextTableCellRendererComponent,
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

    expect(spectator.element).toHaveText('test-text');
  });

  test('should render a missing string', () => {
    const spectator = buildComponent();

    expect(spectator.element).toHaveText('');
  });
});
