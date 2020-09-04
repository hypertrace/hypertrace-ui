import { TableCellAlignmentType } from '@hypertrace/components';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { TableCellStringParser } from '../cells/data-parsers/table-cell-string-parser';
import { TextTableCellRendererComponent } from '../cells/data-renderers/text/text-table-cell-renderer.component';
import { TableCellRendererLookupService } from '../cells/table-cell-renderer-lookup.service';
import { TableColumnConfigExtended } from '../table.service';
import { TableHeaderCellRendererComponent } from './table-header-cell-renderer.component';

describe('Table Header Cell Renderer', () => {
  const createHost = createHostFactory({
    component: TableHeaderCellRendererComponent,
    shallow: true,
    providers: [
      mockProvider(TableCellRendererLookupService, {
        lookup: () => ({
          alignment: TableCellAlignmentType.Center
        })
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
      `<ht-table-header-cell-renderer [columnConfig]="columnConfig" index="0"></ht-table-header-cell-renderer>`,
      {
        hostProps: {
          columnConfig: columnConfig
        }
      }
    );

    expect(spectator.query('.table-header-cell-renderer')).toHaveClass('sortable');
  });

  test('should not have sortable class, if column cannot be sorted', () => {
    const columnConfig: TableColumnConfigExtended = {
      id: 'test-column',
      renderer: TextTableCellRendererComponent,
      parser: new TableCellStringParser(undefined!),
      filterValues: [],
      sortable: false
    };

    const spectator = createHost(
      `<ht-table-header-cell-renderer [columnConfig]="columnConfig" index="0"></ht-table-header-cell-renderer>`,
      {
        hostProps: {
          columnConfig: columnConfig
        }
      }
    );

    expect(spectator.query('.table-header-cell-renderer')).not.toHaveClass('sortable');
  });
});
