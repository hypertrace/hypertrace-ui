import { StringArrayDisplayComponent } from './../../../../string-array/string-array-display.component';
import { FormattingModule } from '@hypertrace/common';
import { TableCellNoOpParser } from '@hypertrace/components';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { tableCellDataProvider, tableCellProviders } from '../../test/cell-providers';
import { StringArrayTableCellRendererComponent } from './string-array-table-cell-renderer.component';

describe('String array table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: StringArrayTableCellRendererComponent,
    declarations: [MockComponent(StringArrayDisplayComponent)],
    imports: [FormattingModule],
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

  test('should pass the values to string array display component', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider(['first-item', 'second-item', 'third-item'])]
    });

    expect(spectator.query(StringArrayDisplayComponent)?.values).toEqual(['first-item', 'second-item', 'third-item']);
  });

  test('should pass the empty array to string array display component', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider([])]
    });

    expect(spectator.query(StringArrayDisplayComponent)?.values).toEqual([]);
  });
});
