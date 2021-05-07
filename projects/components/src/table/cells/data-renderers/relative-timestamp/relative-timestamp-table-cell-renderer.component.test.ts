import { DisplayDatePipe } from '@hypertrace/common';
import {
  TableCellNoOpParser,
  tableCellProviders,
  tableCellRowDataProvider,
  TooltipDirective
} from '@hypertrace/components';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent, MockPipe } from 'ng-mocks';
import { tableCellDataProvider } from '../../test/cell-providers';
import {
  RelativeTimestampTableCellRendererComponent,
  RowData
} from './relative-timestamp-table-cell-renderer.component';

describe('relative timestamp table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: RelativeTimestampTableCellRendererComponent,
    providers: [
      tableCellProviders(
        {
          id: 'test'
        },
        new TableCellNoOpParser(undefined!)
      )
    ],
    declarations: [MockComponent(TooltipDirective), MockPipe(DisplayDatePipe)],
    shallow: true
  });

  test('testing component properties', () => {
    const logEvent: RowData = {
      baseTimestamp: new Date(1619785437887)
    };
    const spectator = buildComponent({
      providers: [tableCellRowDataProvider(logEvent), tableCellDataProvider(new Date(1619785437887))]
    });

    expect(spectator.queryAll('.relative-timestamp')[0]).toContainText('0 ms');
    expect(spectator.component.duration).toBe(0);
  });
});
