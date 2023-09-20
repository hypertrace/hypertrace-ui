/* eslint-disable max-lines */
import { fakeAsync, flush } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { DomElementMeasurerService, NavigationService, PreferenceService } from '@hypertrace/common';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { EMPTY, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { LetAsyncModule } from '../let-async/let-async.module';
import { PaginatorComponent } from '../paginator/paginator.component';
import { SearchBoxComponent } from '../search-box/search-box.component';
import { TableCellStringParser } from './cells/data-parsers/table-cell-string-parser';
import { TextTableCellRendererComponent } from './cells/data-renderers/text/text-table-cell-renderer.component';
import { CoreTableCellRendererType } from './cells/types/core-table-cell-renderer-type';
import { TableCdkRowUtil } from './data/table-cdk-row-util';
import { StatefulTableRow, TableColumnConfig, TableMode, TableSelectionMode, TableSortDirection } from './table-api';
import { TableComponent } from './table.component';
import { TableColumnConfigExtended, TableService } from './table.service';
import { ModalService } from '../modal/modal.service';

describe('Table component', () => {
  // TODO remove builders once table stops mutating inputs
  const buildData = () => [
    {
      firstId: 'first 1',
      secondId: 'second 1'
    },
    {
      firstId: 'first 2',
      secondId: 'second 2'
    }
  ];

  const buildColumns = (): TableColumnConfigExtended[] => [
    {
      id: 'firstId',
      renderer: TextTableCellRendererComponent,
      parser: new TableCellStringParser(undefined!),
      filterValues: [],
      width: 100,
      visible: true
    },
    {
      id: 'secondId',
      renderer: TextTableCellRendererComponent,
      parser: new TableCellStringParser(undefined!),
      filterValues: [],
      width: 200,
      visible: true
    }
  ];
  const createHost = createHostFactory({
    component: TableComponent,
    shallow: true,
    imports: [LetAsyncModule],
    providers: [
      mockProvider(NavigationService),
      mockProvider(ActivatedRoute),
      mockProvider(ActivatedRoute, {
        queryParamMap: EMPTY
      }),
      mockProvider(DomElementMeasurerService, {
        measureHtmlElement: (): Partial<ClientRect> => ({
          top: 0,
          left: 0,
          bottom: 20,
          right: 200,
          height: 20,
          width: 200
        })
      }),
      mockProvider(TableService, {
        buildExtendedColumnConfigs: (columnConfigs: TableColumnConfig[]) => columnConfigs as TableColumnConfigExtended[]
      }),
      mockProvider(ModalService, {
        createModal: jest.fn().mockReturnValue({ closed$: of([]) })
      }),
      mockProvider(PreferenceService, {
        getOnce: jest.fn().mockReturnValue({ columns: [] }),
        set: jest.fn()
      })
    ],
    declarations: [MockComponent(PaginatorComponent), MockComponent(SearchBoxComponent)],
    template: `
      <ht-table
        [columnConfigs]="columnConfigs"
        [data]="data"
        [syncWithUrl]="syncWithUrl">
      </ht-table>
    `
  });

  test('pass custom page size options to paginator', fakeAsync(() => {
    const spectator = createHost(
      `<ht-table [columnConfigs]="columnConfigs" [data]="data" [pageSizeOptions]="pageSizeOptions"></ht-table>`,
      {
        hostProps: {
          columnConfigs: buildColumns(),
          data: buildData(),
          pageSizeOptions: [10, 25]
        }
      }
    );

    expect(spectator.query(PaginatorComponent)?.pageSizeOptions).toEqual([10, 25]);
    flush();
  }));

  test('does not alter the URL on paging if syncWithUrl false', fakeAsync(() => {
    const mockPageChange = jest.fn();
    const spectator = createHost(
      `<ht-table [columnConfigs]="columnConfigs" [data]="data" [syncWithUrl]="syncWithUrl"
         (pageChange)="pageChange($event)"></ht-table>`,
      {
        hostProps: {
          columnConfigs: buildColumns(),
          data: buildData(),
          syncWithUrl: false,
          pageChange: mockPageChange
        }
      }
    );

    spectator.triggerEventHandler(PaginatorComponent, 'pageChange', {
      pageIndex: 1,
      pageSize: 50
    });

    expect(spectator.inject(NavigationService).addQueryParametersToUrl).not.toHaveBeenCalled();
    expect(mockPageChange).toHaveBeenCalledWith({
      pageIndex: 1,
      pageSize: 50
    });
    flush();
  }));

  test('should not clear empty selections on page change', fakeAsync(() => {
    const rows = buildData();
    const mockSelectionsChange = jest.fn();
    const spectator = createHost(
      `<ht-table [columnConfigs]="columnConfigs" [data]="data" syncWithUrl="false"
          (selectionsChange)="selectionsChange($event)"></ht-table>`,
      {
        hostProps: {
          columnConfigs: buildColumns(),
          data: rows,
          selectionsChange: mockSelectionsChange
        }
      }
    );

    spectator.triggerEventHandler(PaginatorComponent, 'pageChange', {
      pageIndex: 1,
      pageSize: 50
    });

    expect(mockSelectionsChange).not.toHaveBeenCalled();
    flush();
  }));

  test('should clear non empty selections on page change', fakeAsync(() => {
    const rows = buildData();
    const mockSelectionsChange = jest.fn();
    const spectator = createHost(
      `<ht-table [columnConfigs]="columnConfigs" [data]="data" syncWithUrl="false"
         [selections]="selections" (selectionsChange)="selectionsChange($event)"></ht-table>`,
      {
        hostProps: {
          columnConfigs: buildColumns(),
          data: rows,
          selections: TableCdkRowUtil.buildInitialRowStates(rows),
          selectionsChange: mockSelectionsChange
        }
      }
    );

    spectator.triggerEventHandler(PaginatorComponent, 'pageChange', {
      pageIndex: 1,
      pageSize: 50
    });

    expect(mockSelectionsChange).toHaveBeenCalledWith([]);
    flush();
  }));

  test('updates the URL on paging if syncWithUrl true', fakeAsync(() => {
    const mockPageChange = jest.fn();
    const spectator = createHost(
      `<ht-table [columnConfigs]="columnConfigs" [data]="data" [syncWithUrl]="syncWithUrl"
         (pageChange)="pageChange($event)"></ht-table>`,
      {
        hostProps: {
          columnConfigs: buildColumns(),
          data: buildData(),
          syncWithUrl: true,
          pageChange: mockPageChange
        }
      }
    );

    spectator.triggerEventHandler(PaginatorComponent, 'pageChange', {
      pageIndex: 1,
      pageSize: 50
    });

    expect(spectator.inject(NavigationService).addQueryParametersToUrl).toHaveBeenCalledWith({
      page: 1,
      'page-size': 50
    });
    expect(mockPageChange).toHaveBeenCalledWith({
      pageIndex: 1,
      pageSize: 50
    });
    flush();
  }));

  test('reads page data from URL if syncWithUrl true', fakeAsync(() => {
    const spectator = createHost(undefined, {
      hostProps: {
        columnConfigs: buildColumns(),
        data: buildData(),
        syncWithUrl: true
      },
      providers: [
        mockProvider(ActivatedRoute, {
          queryParamMap: of(
            convertToParamMap({
              page: 1,
              'page-size': 100
            })
          )
        })
      ]
    });

    const paginator = spectator.query(PaginatorComponent);
    expect(paginator?.pageSize).toBe(100);
    expect(paginator?.pageIndex).toBe(1);
    flush();
  }));

  test('reads sort data from URL if syncWithUrl true', fakeAsync(() => {
    const spectator = createHost(undefined, {
      hostProps: {
        columnConfigs: buildColumns(),
        data: buildData(),
        syncWithUrl: true
      },
      providers: [
        mockProvider(ActivatedRoute, {
          queryParamMap: of(
            convertToParamMap({
              'sort-by': 'firstId',
              'sort-direction': TableSortDirection.Ascending
            })
          )
        })
      ]
    });
    spectator.tick();

    expect(spectator.component.columnConfigs![0]).toEqual(
      expect.objectContaining({
        sort: TableSortDirection.Ascending,
        id: 'firstId'
      })
    );
  }));

  test('does not alter the URL on sorting if syncWithUrl false', fakeAsync(() => {
    const columns = buildColumns();
    const spectator = createHost(undefined, {
      hostProps: {
        columnConfigs: columns,
        data: buildData(),
        syncWithUrl: false
      }
    });

    spectator.component.onSortChange(TableSortDirection.Ascending, columns[0]);

    expect(spectator.inject(NavigationService).addQueryParametersToUrl).not.toHaveBeenCalled();
    flush();
  }));

  test('updates the URL on sorting if syncWithUrl true', fakeAsync(() => {
    const columns = buildColumns();
    const spectator = createHost(undefined, {
      hostProps: {
        columnConfigs: columns,
        data: buildData(),
        syncWithUrl: true
      }
    });

    spectator.component.onSortChange(TableSortDirection.Ascending, columns[0]);

    expect(spectator.inject(NavigationService).addQueryParametersToUrl).toHaveBeenCalledWith({
      'sort-by': 'firstId',
      'sort-direction': TableSortDirection.Ascending
    });
    flush();
  }));

  test('adds the multi select row column config for multi select mode', fakeAsync(() => {
    const columns = buildColumns();
    const spectator = createHost(
      '<ht-table [columnConfigs]="columnConfigs" [data]="data" [selectionMode]="selectionMode" [mode]="mode"></ht-table>',
      {
        hostProps: {
          columnConfigs: columns,
          data: buildData(),
          selectionMode: TableSelectionMode.Multiple,
          mode: TableMode.Flat
        }
      }
    );
    spectator.tick();

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.columnConfigs$).toBe('x', {
        x: [
          expect.objectContaining({
            id: '$$selected',
            display: CoreTableCellRendererType.Checkbox,
            visible: true
          }),
          expect.objectContaining({
            id: 'firstId'
          }),
          expect.objectContaining({
            id: 'secondId'
          })
        ]
      });
    });
  }));

  test('skips the multi select row column config for single select mode', fakeAsync(() => {
    const columns = buildColumns();
    const spectator = createHost(
      '<ht-table [columnConfigs]="columnConfigs" [data]="data" [selectionMode]="selectionMode" [mode]="mode"></ht-table>',
      {
        hostProps: {
          columnConfigs: columns,
          data: buildData(),
          selectionMode: TableSelectionMode.Single,
          mode: TableMode.Flat
        }
      }
    );
    spectator.tick();

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.columnConfigs$).toBe('x', {
        x: [
          expect.objectContaining({
            id: 'firstId'
          }),
          expect.objectContaining({
            id: 'secondId'
          })
        ]
      });
    });
  }));

  test('expander column config and no multi select row column config for non flat table mode', fakeAsync(() => {
    const columns = buildColumns();
    const spectator = createHost(
      '<ht-table [columnConfigs]="columnConfigs" [data]="data" [selectionMode]="selectionMode" [mode]="mode"></ht-table>',
      {
        hostProps: {
          columnConfigs: columns,
          data: buildData(),
          selectionMode: TableSelectionMode.Multiple,
          mode: TableMode.Tree
        }
      }
    );
    spectator.tick();

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(
        spectator.component.columnConfigs$.pipe(
          map(columnConfigs => columnConfigs.map(columnConfig => spectator.component.isExpanderColumn(columnConfig)))
        )
      ).toBe('x', {
        x: [false, true, false, false]
      });

      expectObservable(spectator.component.columnConfigs$).toBe('x', {
        x: [
          expect.objectContaining({
            id: '$$selected',
            display: CoreTableCellRendererType.Checkbox,
            visible: true
          }),
          expect.objectContaining({
            id: '$$expanded',
            display: CoreTableCellRendererType.RowExpander,
            visible: true
          }),
          expect.objectContaining({
            id: 'firstId'
          }),
          expect.objectContaining({
            id: 'secondId'
          })
        ]
      });
    });
  }));

  test('should emit selections on toggle select', fakeAsync(() => {
    const mockSelectionsChange = jest.fn();
    const columns = buildColumns();
    const spectator = createHost(
      `<ht-table [columnConfigs]="columnConfigs" [data]="data" [selectionMode]="selectionMode"
         [mode]="mode" (selectionsChange)="selectionsChange($event)"></ht-table>`,
      {
        hostProps: {
          columnConfigs: columns,
          data: buildData(),
          selectionMode: TableSelectionMode.Multiple,
          mode: TableMode.Flat,
          selectionsChange: mockSelectionsChange
        }
      }
    );

    const row: StatefulTableRow = {
      $$state: {
        parent: undefined,
        expanded: false,
        selected: false,
        root: false,
        leaf: true,
        depth: 1
      }
    };

    spectator.component.toggleRowSelected(row);
    expect(mockSelectionsChange).toHaveBeenCalledWith([row]);

    spectator.component.toggleRowSelected(row);
    expect(mockSelectionsChange).toHaveBeenCalledWith([row]);
    flush();
  }));

  test('should select only selected rows', fakeAsync(() => {
    const columns = buildColumns();
    const rows = buildData();
    const statefulRows = TableCdkRowUtil.buildInitialRowStates(rows);
    const spectator = createHost(
      `<ht-table [columnConfigs]="columnConfigs" [data]="data" [selectionMode]="selectionMode"
         [mode]="mode" [selections]="selections"></ht-table>`,
      {
        hostProps: {
          columnConfigs: columns,
          data: rows,
          selectionMode: TableSelectionMode.Multiple,
          mode: TableMode.Flat,
          selections: statefulRows
        }
      }
    );

    spectator.tick();

    expect(spectator.component.selections).toBeDefined();
    statefulRows.forEach(row => expect(row.$$state.selected).toBeTruthy());

    // Change selections to just first stateful row
    const firstStatefulRow = statefulRows[0];
    const spyUnselectRows = jest.spyOn(spectator.component.dataSource!, 'unselectAllRows');
    spectator.setHostInput('selections', [firstStatefulRow]);
    spectator.detectChanges();
    expect(spyUnselectRows).toHaveBeenCalled();
    expect(firstStatefulRow.$$state.selected).toBeTruthy();
  }));

  test('row should be highlighted only in non multi selection mode', fakeAsync(() => {
    const columns = buildColumns();
    const rows = buildData();
    const statefulRows = TableCdkRowUtil.buildInitialRowStates(rows);
    const spectator = createHost(
      `<ht-table [columnConfigs]="columnConfigs" [data]="data" [selectionMode]="selectionMode"
         [mode]="mode" [selections]="selections"></ht-table>`,
      {
        hostProps: {
          columnConfigs: columns,
          data: rows,
          selectionMode: TableSelectionMode.Single,
          mode: TableMode.Flat,
          selections: [statefulRows[0]]
        }
      }
    );

    expect(spectator.component.shouldHighlightRowAsSelection(statefulRows[0])).toBeTruthy();
    expect(spectator.component.shouldHighlightRowAsSelection(statefulRows[1])).toBeFalsy();
    flush();
  }));

  test('row should be highlighted (even) when in multi selection mode', fakeAsync(() => {
    const columns = buildColumns();
    const rows = buildData();
    const statefulRows = TableCdkRowUtil.buildInitialRowStates(rows);
    const spectator = createHost(
      `<ht-table [columnConfigs]="columnConfigs" [data]="data" [selectionMode]="selectionMode"
         [mode]="mode" [selections]="selections"></ht-table>`,
      {
        hostProps: {
          columnConfigs: columns,
          data: rows,
          selectionMode: TableSelectionMode.Multiple,
          mode: TableMode.Flat,
          selections: [statefulRows[0]]
        }
      }
    );

    expect(spectator.component.shouldHighlightRowAsSelection(statefulRows[0])).toBeTruthy();
    expect(spectator.component.shouldHighlightRowAsSelection(statefulRows[1])).toBeFalsy();
    flush();
  }));

  test('should allow column width resize', fakeAsync(() => {
    const spectator = createHost(`<ht-table [columnConfigs]="columnConfigs" [data]="data"></ht-table>`, {
      hostProps: {
        columnConfigs: buildColumns(),
        data: {
          getData: buildData
        }
      }
    });
    spectator.tick();

    const resizeHandlerElem = document.createElement('div');

    const mouseEvent = {
      clientX: 0,
      preventDefault: () => {
        /* No-op */
      },
      target: resizeHandlerElem
    };

    spectator.component.headerRowElement = {
      nativeElement: {
        offsetLeft: 0,
        offsetWidth: 300
      } as HTMLElement
    };

    spectator.component.queryHeaderCellElement = (index: number) =>
      [
        {
          offsetLeft: 0,
          offsetWidth: 100
        },
        {
          offsetLeft: 100,
          offsetWidth: 200
        }
      ][index] as HTMLElement;

    spectator.component.onResizeMouseDown((mouseEvent as unknown) as MouseEvent, 1);
    spectator.dispatchMouseEvent('cdk-table', 'mousemove', 1, 0);
    spectator.dispatchMouseEvent('cdk-table', 'mouseup');
    spectator.tick(21);

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.columnConfigs$).toBe('x', {
        x: [
          expect.objectContaining({
            width: 100
          }),
          expect.objectContaining({
            width: '200px'
          })
        ]
      });
    });
  }));
});
