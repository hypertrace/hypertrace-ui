import {
  TableCellNoOpParser,
  tableCellProviders,
  tableCellRowDataProvider,
  TooltipDirective
} from '@hypertrace/components';
import { LogEvent } from '@hypertrace/distributed-tracing';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { LogTimestampTableCellRendererComponent } from './log-timestamp-table-cell-renderer.component';

describe('log timestamp table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: LogTimestampTableCellRendererComponent,
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
    const logEvent: LogEvent = {
      timestamp: '2021-04-30T12:23:57.889149Z',
      spanStartTime: 1619785437887
    };
    const spectator = buildComponent({
      providers: [tableCellRowDataProvider(logEvent)]
    });

    expect(spectator.queryAll('.log-timestamp')[0]).toContainText('2.89 ms');
    expect(spectator.component.spanStartTime).toBe(logEvent.spanStartTime);
    expect(spectator.component.timestamp).toBe(logEvent.timestamp);
    expect(spectator.component.duration).toBe('2.89 ms');
    expect(spectator.component.readableDateTime).toBe('2021/04/30 12:23:57.889');
  });
});
