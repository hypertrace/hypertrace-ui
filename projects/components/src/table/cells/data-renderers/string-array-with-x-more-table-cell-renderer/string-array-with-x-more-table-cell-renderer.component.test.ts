import { FormattingModule } from '@hypertrace/common';
import { TableCellNoOpParser, XMoreComponent } from '@hypertrace/components';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { tableCellDataProvider, tableCellProviders } from '../../test/cell-providers';
import { StringArrayWithXMore, StringArrayWithXMoreTableCellRendererComponent } from './string-array-with-x-more-table-cell-renderer.component';

describe('String array table cell renderer component', () => {
  const buildComponent = createComponentFactory({
    component: StringArrayWithXMoreTableCellRendererComponent,
    imports: [FormattingModule],
    providers: [
      tableCellProviders(
        {
          id: 'test'
        },
        new TableCellNoOpParser(undefined!)
      )
    ],
    declarations: [MockComponent(XMoreComponent)],
    shallow: true
  });

  test('should render array with multiple items as expected', () => {
    
    const cellData: StringArrayWithXMore = {
      items: ['first-item', 'second-item', 'third-item'], 
      maxToShow: 2
    }
    const spectator = buildComponent({
      providers: [tableCellDataProvider(cellData)]
    });

    expect(spectator.queryAll('.item').length).toEqual(cellData.maxToShow);
    expect(spectator.query(XMoreComponent)?.count).toEqual(1);
  });

  test('should render array with no item as expected', () => {
    
    const cellData: StringArrayWithXMore = {
      items: [], 
      maxToShow: 2
    }
    const spectator = buildComponent({
      providers: [tableCellDataProvider(cellData)]
    });

    expect(spectator.query('.empty-cell')).toExist();
  });
});
