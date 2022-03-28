import { DisplayDurationPipe } from '@hypertrace/common';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockPipe } from 'ng-mocks';
import { TableCellNoOpParser } from '../../data-parsers/table-cell-no-op-parser';
import { tableCellProviders } from '../../test/cell-providers';
import { DurationTableCellRendererComponent } from './duration-table-cell-renderer.component';

describe('Duration table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: DurationTableCellRendererComponent,
    providers: [
      tableCellProviders(
        {
          id: 'test'
        },
        new TableCellNoOpParser(undefined!),
        0,
        14400000
      )
    ],
    declarations: [MockPipe(DisplayDurationPipe)],
    shallow: true
  });

  test('Should render duration text', () => {
    const spectator = buildComponent();

    expect(spectator.query('.duration-cell')).toExist();
    expect(spectator.query('.duration-text')).toExist();
  });
});
