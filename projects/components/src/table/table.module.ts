import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ButtonModule } from '../button/button.module';
import { CheckboxModule } from '../checkbox/checkbox.module';
import { IconModule } from '../icon/icon.module';
import { LetAsyncModule } from '../let-async/let-async.module';
import { LoadAsyncModule } from '../load-async/load-async.module';
import { PaginatorModule } from '../paginator/paginator.module';
import { TraceSearchBoxModule } from '../search-box/search-box.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { TableCellParserConstructor } from './cells/table-cell-parser';
import { TableCellRendererConstructor } from './cells/table-cell-renderer';
import {
  TABLE_CELL_CSV_GENERATORS,
  TABLE_CELL_PARSERS,
  TABLE_CELL_RENDERERS,
  TableCellsModule
} from './cells/table-cells.module';
import { TableEditColumnsModalComponent } from './columns/table-edit-columns-modal.component';
import { TableComponent } from './table.component';
import { DraggableListModule } from '../draggable-list/draggable-list.module';
import { ExpanderToggleModule } from '../expander/expander-toggle.module';
import { MemoizeModule } from '@hypertrace/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutChangeModule } from '../layout/layout-change.module';
import { TableCellCsvGeneratorConstructor } from './cells/table-cell-csv-generator-lookup.service';

@NgModule({
  imports: [
    CommonModule,
    CdkTableModule,
    DragDropModule,
    IconModule,
    TooltipModule,
    TableCellsModule,
    PaginatorModule,
    TraceSearchBoxModule,
    LoadAsyncModule,
    LetAsyncModule,
    ButtonModule,
    CheckboxModule,
    DraggableListModule,
    ExpanderToggleModule,
    MemoizeModule,
    TraceSearchBoxModule,
    LayoutChangeModule
  ],
  declarations: [TableComponent, TableEditColumnsModalComponent],
  exports: [TableComponent]
})
export class TableModule {
  public static withCellParsers(
    cellParsers: TableCellParserConstructor<unknown, unknown, unknown>[]
  ): ModuleWithProviders<TableModule> {
    return {
      ngModule: TableModule,
      providers: [
        {
          provide: TABLE_CELL_PARSERS,
          useValue: cellParsers,
          multi: true
        }
      ]
    };
  }
  public static withCellCsvGenerators(
    cellCsvGenerators: TableCellCsvGeneratorConstructor<unknown, unknown>[]
  ): ModuleWithProviders<TableModule> {
    return {
      ngModule: TableModule,
      providers: [
        {
          provide: TABLE_CELL_CSV_GENERATORS,
          useValue: cellCsvGenerators,
          multi: true
        }
      ]
    };
  }
  public static withCellRenderers(cellRenderers: TableCellRendererConstructor[]): ModuleWithProviders<TableModule> {
    return {
      ngModule: TableModule,
      providers: [
        {
          provide: TABLE_CELL_RENDERERS,
          useValue: cellRenderers,
          multi: true
        }
      ]
    };
  }
}
