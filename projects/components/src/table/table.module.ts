import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { LetAsyncModule } from '../let-async/let-async.module';
import { LoadAsyncModule } from '../load-async/load-async.module';
import { PaginatorModule } from '../paginator/paginator.module';
import { TraceSearchBoxModule } from '../search-box/search-box.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { TableCellParserConstructor } from './cells/table-cell-parser';
import { TableCellRendererConstructor } from './cells/table-cell-renderer';
import { TableCellsModule, TABLE_CELL_PARSERS, TABLE_CELL_RENDERERS } from './cells/table-cells.module';
import { TableColumnsModule } from './columns/table-columns.module';
import { TableComponent } from './table.component';

@NgModule({
  imports: [
    CommonModule,
    CdkTableModule,
    IconModule,
    TooltipModule,
    TableCellsModule,
    TableColumnsModule,
    PaginatorModule,
    TraceSearchBoxModule,
    LoadAsyncModule,
    LetAsyncModule
  ],
  declarations: [TableComponent],
  exports: [TableComponent]
})
// tslint:disable-next-line: no-unnecessary-class
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
