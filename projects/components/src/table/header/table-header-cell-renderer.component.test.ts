import { TemplateRef } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { FilterParserLookupService } from '../../filtering/filter/parser/filter-parser-lookup.service';
import { ModalService } from '../../modal/modal.service';
import { TableCellStringParser } from '../cells/data-parsers/table-cell-string-parser';
import { TextTableCellRendererComponent } from '../cells/data-renderers/text/text-table-cell-renderer.component';
import { TableSortDirection } from '../table-api';
import { TableColumnConfigExtended } from '../table.service';
import { TableHeaderCellRendererComponent } from './table-header-cell-renderer.component';

describe('Table Header Cell Renderer', () => {
  const createHost = createHostFactory({
    component: TableHeaderCellRendererComponent,
    shallow: true,
    providers: [mockProvider(ModalService), mockProvider(FilterParserLookupService)],
    template: `
      <ht-table-header-cell-renderer [columnConfig]="columnConfig" index="0" (sortChange)="sortChange($event)"
      ></ht-table-header-cell-renderer>
    `
  });

  test('should have sortable class, if column can be sorted', () => {
    const columnConfig: TableColumnConfigExtended = {
      id: 'test-column',
      renderer: TextTableCellRendererComponent,
      parser: new TableCellStringParser(undefined!),
      filterValues: [],
      sortable: true
    };

    const spectator = createHost(undefined, {
      hostProps: {
        columnConfig: columnConfig
      }
    });

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

    const spectator = createHost(undefined, {
      hostProps: {
        columnConfig: columnConfig
      }
    });

    expect(spectator.query('.table-header-cell-renderer')).not.toHaveClass('sortable');
  });

  test('should sort column when header title is clicked', fakeAsync(() => {
    const sortChange = jest.fn();

    const columnConfig: TableColumnConfigExtended = {
      id: 'test-column',
      renderer: TextTableCellRendererComponent,
      parser: new TableCellStringParser(undefined!),
      filterValues: [],
      sortable: true
    };

    const spectator = createHost(undefined, {
      hostProps: {
        columnConfig: columnConfig,
        sortChange: sortChange
      }
    });

    spectator.click(spectator.query('.title')!);
    expect(sortChange).toHaveBeenCalledWith(TableSortDirection.Ascending);
  }));

  test('should show sort hover menu options if the column is sortable', () => {
    const columnConfig: TableColumnConfigExtended = {
      id: 'test-column',
      renderer: TextTableCellRendererComponent,
      parser: new TableCellStringParser(undefined!),
      filterValues: [],
      sortable: true
    };

    const spectator = createHost(undefined, {
      hostProps: {
        columnConfig: columnConfig
      }
    });

    spectator.click('.options-button');
    expect(spectator.query('.sort-ascending', { root: true })).toExist();
    expect(spectator.query('.sort-descending', { root: true })).toExist();
  });

  test('should not show sort hover menu options if the column is not sortable', () => {
    const columnConfig: TableColumnConfigExtended = {
      id: 'test-column',
      renderer: TextTableCellRendererComponent,
      parser: new TableCellStringParser(undefined!),
      filterValues: [],
      sortable: false
    };

    const spectator = createHost(undefined, {
      hostProps: {
        columnConfig: columnConfig
      }
    });

    spectator.click('.options-button');
    expect(spectator.query('.sort-ascending', { root: true })).not.toExist();
    expect(spectator.query('.sort-descending', { root: true })).not.toExist();
  });

  test('should create tooltip correctly', () => {
    const columnConfig: TableColumnConfigExtended = {
      id: 'test-column',
      renderer: TextTableCellRendererComponent,
      parser: new TableCellStringParser(undefined!),
      filterValues: [],
      titleTooltip: 'html:<div></div>',
      sortable: false
    };

    const spectator = createHost(undefined, {
      hostProps: {
        columnConfig: columnConfig
      }
    });

    expect(spectator.component.getTooltip('html:<div></div>', 'title') instanceof TemplateRef).toBe(true);
    expect(spectator.component.getTooltip('titleTooltip', 'title')).toBe('titleTooltip');
    expect(spectator.component.getTooltip(undefined, 'title')).toBe('title');
  });
});
