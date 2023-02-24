import { FormattingModule } from '@hypertrace/common';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { TableCellTimestampParser } from '../../data-parsers/table-cell-timestamp-parser';
import { tableCellDataProvider, tableCellProviders } from '../../test/cell-providers';
import { TimeAgoTableCellRendererComponent } from './time-ago-table-cell-renderer.component';

describe('Time Ago table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: TimeAgoTableCellRendererComponent,
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

  test('renders less than a minute ago', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider(new Date().getTime())]
    });

    expect(spectator.element).toHaveText('Just now');
  });

  test('renders a date from over a minute ago', () => {
    const now = new Date();
    const before = new Date(now);
    before.setMinutes(now.getMinutes() - 1);

    const spectator = buildComponent({
      providers: [tableCellDataProvider(before)]
    });

    expect(spectator.element).toHaveText('1 minute ago');
  });

  test('renders a date from over two minute ago', () => {
    const now = new Date();
    const before = new Date(now);
    before.setMinutes(now.getMinutes() - 2);

    const spectator = buildComponent({
      providers: [tableCellDataProvider(before)]
    });

    expect(spectator.element).toHaveText('2 minutes ago');
  });

  test('renders a date from over two hours ago', () => {
    const now = new Date();
    const before = new Date(now);
    before.setHours(now.getHours() - 2);

    const spectator = buildComponent({
      providers: [tableCellDataProvider(before)]
    });

    expect(spectator.element).toHaveText('2 hours ago');
  });

  test('renders a missing date', () => {
    const spectator = buildComponent();

    expect(spectator.element).toHaveText('-');
  });
});
