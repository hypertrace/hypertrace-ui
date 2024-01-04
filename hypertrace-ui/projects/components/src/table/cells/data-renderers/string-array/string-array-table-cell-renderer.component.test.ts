import { FormattingModule } from '@hypertrace/common';
import { tableCellColumnProvider, TableCellNoOpParser, XMoreComponent } from '@hypertrace/components';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { tableCellDataProvider, tableCellProviders } from '../../test/cell-providers';
import { StringArrayTableCellRendererComponent } from './string-array-table-cell-renderer.component';
import { StringArrayTableCellDisplayMode } from './types';

describe('String array table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: StringArrayTableCellRendererComponent,
    declarations: [MockComponent(XMoreComponent)],
    imports: [FormattingModule],
    providers: [
      tableCellProviders(
        {
          id: 'test',
        },
        new TableCellNoOpParser(undefined!),
      ),
    ],

    shallow: true,
  });

  test('should render an array with one item as expected; viewMode = list', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider(['first-item'])],
    });

    expect(spectator.query('.first-item')).toHaveText('first-item');
    expect(spectator.query(XMoreComponent)?.count).toBe(0);
  });

  test('should render an empty array as expected; viewMode = list', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider([])],
    });

    expect(spectator.query('.string-array-cell')).toHaveText('-');
    expect(spectator.query('.first-item')).not.toExist();
    expect(spectator.query(XMoreComponent)).not.toExist();
  });

  test('should render array with multiple items as expected; viewMode = list', () => {
    const spectator = buildComponent({
      providers: [tableCellDataProvider(['first-item', 'second-item', 'third-item'])],
    });

    expect(spectator.query('.first-item')).toHaveText('first-item');
    expect(spectator.query(XMoreComponent)?.count).toBe(2);
  });

  test('should render array with multiple items as expected; viewMode = countWithListTooltip', () => {
    const spectator = buildComponent({
      providers: [
        tableCellDataProvider(['first-item', 'second-item', 'third-item']),
        tableCellColumnProvider({
          id: 'test-id',
          options: {
            viewMode: StringArrayTableCellDisplayMode.CountWithListTooltip,
          },
        }),
      ],
    });

    expect(spectator.query('.first-item')).toHaveText('3');
    expect(spectator.query(XMoreComponent)).not.toExist();
  });
});
