import { FormattingModule, MemoizeModule, TimeDuration, TimeUnit } from '@hypertrace/common';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { tableCellDataProvider, tableCellProviders } from '../../test/cell-providers';
import { DurationTableCellRendererComponent } from './duration-table-cell-renderer.component';
import { TableCellNoOpParser } from '../../data-parsers/table-cell-no-op-parser';

describe('Duration table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: DurationTableCellRendererComponent,
    imports: [FormattingModule, MemoizeModule],
    providers: [
      tableCellProviders(
        {
          id: 'test'
        },
        new TableCellNoOpParser(undefined!)
      )
    ],
    shallow: true
  });

  test('Should render duration in defined unit', () => {

    const spectator = buildComponent({
      providers: [tableCellDataProvider(new TimeDuration(4, TimeUnit.Hour))]
    });

    console.log(spectator.component.value);
    expect(spectator.element).toHaveText('4 hours');
  });
});
