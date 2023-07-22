import { FormattingModule } from '@hypertrace/common';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockDirective } from 'ng-mocks';
import { TooltipDirective } from '../../../../tooltip/tooltip.directive';
import { TableCellStringParser } from '../../data-parsers/table-cell-string-parser';
import { tableCellDataProvider, tableCellProviders } from '../../test/cell-providers';
import { CodeTableCellRendererComponent } from './code-table-cell-renderer.component';

describe('Code table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: CodeTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      tableCellProviders(
        {
          id: 'test'
        },
        new TableCellStringParser(undefined!)
      )
    ],
    declarations: [MockDirective(TooltipDirective)],
    shallow: true
  });

  test('should render a plain string', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider('test text')]
    });

    expect(spectator.element).toHaveText('test text');
    expect(spectator.query(TooltipDirective)?.content).toBe('test text');
  });

  test('should render a missing string', () => {
    const spectator = buildComponent();

    expect(spectator.element).toHaveText('-');
    expect(spectator.query(TooltipDirective)?.content).toBe('-');
  });
});
