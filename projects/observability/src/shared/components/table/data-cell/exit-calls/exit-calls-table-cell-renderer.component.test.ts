import {
  tableCellDataProvider,
  TableCellNoOpParser,
  tableCellProviders,
  TooltipDirective
} from '@hypertrace/components';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { ExitCallsTableCellRendererComponent } from './exit-calls-table-cell-renderer.component';

describe('Exit Calls table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: ExitCallsTableCellRendererComponent,
    providers: [
      tableCellProviders(
        {
          id: 'test'
        },
        new TableCellNoOpParser(undefined!)
      )
    ],
    declarations: [MockComponent(TooltipDirective)],
    shallow: true
  });

  test('testing component properties', () => {
    const value = {
      key1: '1',
      key2: '2'
    };
    const spectator = buildComponent({
      providers: [tableCellDataProvider({ value: [3, value] })]
    });

    expect(spectator.queryAll('.exit-calls-count')[0]).toContainText('3');
    expect(spectator.component.apiCalleeNameEntries).toMatchObject([
      ['key1', '1'],
      ['key2', '2']
    ]);
    expect(spectator.component.uniqueApiCallee).toBe(2);
    expect(spectator.component.apiExitCalls).toBe(3);
  });
});
