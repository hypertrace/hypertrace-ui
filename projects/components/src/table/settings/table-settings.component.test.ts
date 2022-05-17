import { MenuDropdownComponent } from './../../menu-dropdown/menu-dropdown.component';
import { MockComponent } from 'ng-mocks';
import { createHostFactory } from '@ngneat/spectator/jest';
import { TableCellStringParser } from '../cells/data-parsers/table-cell-string-parser';
import { TextTableCellRendererComponent } from '../cells/data-renderers/text/text-table-cell-renderer.component';
import { TableColumnConfigExtended } from '../table.service';
import { TableSettingsComponent } from './table-settings.component';
import { MenuItemComponent } from '../../menu-dropdown/menu-item/menu-item.component';
import { mockProvider } from '@ngneat/spectator';
import { ModalService } from '../../modal/modal.service';

describe('Table Settings', () => {
  const createHost = createHostFactory({
    component: TableSettingsComponent,
    shallow: true,
    declarations: [MockComponent(MenuDropdownComponent), MockComponent(MenuItemComponent)],
    providers: [
      mockProvider(ModalService, {
        createModal: jest.fn()
      })
    ]
  });

  test('should have sortable class, if column can be sorted', () => {
    const columnConfig: TableColumnConfigExtended = {
      id: 'test-column',
      renderer: TextTableCellRendererComponent,
      parser: new TableCellStringParser(undefined!),
      filterValues: [],
      sortable: true
    };

    const spectator = createHost(
      `<ht-table-settings [availableColumns]="availableColumns"
      ></ht-table-settings>`,
      {
        hostProps: {
          availableColumns: [columnConfig]
        }
      }
    );

    const menuItem = spectator.query(MenuItemComponent);
    expect(menuItem?.label).toHaveClass('Edit Columns');
    spectator.click('.action-item');
    expect(spectator.inject(ModalService).createModal).toHaveBeenCalled();
  });
});
