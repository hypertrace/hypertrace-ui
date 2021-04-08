import { TooltipDirective } from '@hypertrace/components';
import { TableCellNoOpParser, tableCellProviders, tableCellRowDataProvider } from '@hypertrace/components';
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

  test('should render a number as expected', () => {
    const spectator = buildComponent({
      providers: [tableCellRowDataProvider({ apiExitCalls: 1 })]
    });

    expect(spectator.query('.exit-calls-count')).toHaveText('1');
    expect(spectator.query(TooltipDirective)).toExist();
  });

  test('testing getMaxShowAPICalleeNameCount function', () => {
    const value = {
      key1: '1',
      key2: '2'
    };
    const spectator = buildComponent({
      providers: [tableCellRowDataProvider({ apiExitCalls: 2, apiCalleeNameCount: value })]
    });

    expect(spectator.component.getMaxShowAPICalleeNameCount(value)).toMatchObject(value);
    expect(spectator.component.totalCountOfDifferentAPICallee).toBe(2);
  });
});
