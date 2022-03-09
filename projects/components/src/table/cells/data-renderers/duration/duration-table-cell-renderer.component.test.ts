import { FormattingModule, TimeDuration, TimeUnit } from '@hypertrace/common';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockPipe } from 'ng-mocks';
import { DisplayStringPipe } from '@hypertrace/common';
import { TableCellTimestampParser } from '../../data-parsers/table-cell-timestamp-parser';
import { tableCellDataProvider, tableCellProviders } from '../../test/cell-providers';
import { DurationTableCellRendererComponent } from './duration-table-cell-renderer.component';

describe('Duration table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: DurationTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      tableCellProviders(
        {
          id: 'test'
        },
        new TableCellTimestampParser(undefined!)
      )
    ],
    declarations: [MockPipe(DisplayStringPipe)],
    shallow: true
  });

  test('Duration in defined unit', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider(new TimeDuration(4, TimeUnit.Hour))]
    });

    expect(spectator.element).toHaveText('4 Hours');
  });

  test('renders a missing duration', () => {
    const spectator = buildComponent();

    expect(spectator.element).toHaveText('-');
  });
});
