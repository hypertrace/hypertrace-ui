import { FormattingModule } from '@hypertrace/common';
import { tableCellDataProvider, tableCellProviders } from '@hypertrace/components';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { TableCellTimestampParser } from '../../data-parsers/table-cell-timestamp-parser';
import { TimestampTableCellRendererComponent } from './timestamp-table-cell-renderer.component';

describe('Timestamp table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: TimestampTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      tableCellProviders(
        {
          id: 'test'
        },
        new TableCellTimestampParser(undefined!)
      )
    ],
    shallow: true
  });

  test('renders a timestamp with format y-M-d hh:mm:ss a', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider(new Date('2019-10-25T18:35:25.428Z').getTime())]
    });

    expect(spectator.element).toHaveText('2019-10-25 06:35:25 PM');
  });

  test('renders a date with format y-M-d hh:mm:ss a', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider(new Date('2019-10-25T18:35:25.428Z'))]
    });

    expect(spectator.element).toHaveText('2019-10-25 06:35:25 PM');
  });

  test('renders a missing date', () => {
    const spectator = buildComponent();

    expect(spectator.element).toHaveText('-');
  });
});
