import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { Inject, InjectionToken, Injector, ModuleWithProviders, NgModule } from '@angular/core';
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
import { TABLE_CELL_PARSERS, TABLE_CELL_RENDERERS, TableCellsModule } from './cells/table-cells.module';
import { TableEditColumnsModalComponent } from './columns/table-edit-columns-modal.component';
import { TableComponent } from './table.component';
import { DraggableListModule } from '../draggable-list/draggable-list.module';
import { ExpanderToggleModule } from '../expander/expander-toggle.module';
import { MemoizeModule } from '@hypertrace/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutChangeModule } from '../layout/layout-change.module';
import { TableCellCsvGeneratorManagementService } from './cells/table-cell-csv-generator-management.service';
import { TABLE_CELL_CSV_GENERATORS, TableCellCsvGeneratorBase } from './cells/table-cell-csv-generator-base';
import { TableCellStringArrayCsvGenerator } from './cells/csv-generators/table-cell-string-array-csv-generator';
import { TableCellBooleanCsvGenerator } from './cells/csv-generators/table-cell-boolean-csv-generator';
import { TableCellNumberCsvGenerator } from './cells/csv-generators/table-cell-number-csv-generator';
import { TableCellStringCsvGenerator } from './cells/csv-generators/table-cell-string-csv-generator';
import { TableCellTimestampCsvGenerator } from './cells/csv-generators/table-cell-timestamp-csv-generator';

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
  exports: [TableComponent],
  providers: [
    {
      provide: TABLE_CELL_CSV_GENERATORS,
      useValue: [
        TableCellStringArrayCsvGenerator,
        TableCellBooleanCsvGenerator,
        TableCellNumberCsvGenerator,
        TableCellStringCsvGenerator,
        TableCellTimestampCsvGenerator
      ],
      multi: true
    }
  ]
})
export class TableModule {
  public constructor(
    csvGeneratorLookupService: TableCellCsvGeneratorManagementService,
    injector: Injector,
    @Inject(TABLE_CELL_CSV_GENERATORS) csvGeneratorTokens: InjectionToken<TableCellCsvGeneratorBase<unknown>>[][]
  ) {
    csvGeneratorTokens
      .flat()
      .map(token => injector.get(token))
      .forEach(generator => csvGeneratorLookupService.register(generator));
  }

  public static withCsvGenerators(csvGenerators: unknown[]): ModuleWithProviders<TableModule> {
    return {
      ngModule: TableModule,
      providers: [
        {
          provide: TABLE_CELL_CSV_GENERATORS,
          useValue: csvGenerators,
          multi: true
        }
      ]
    };
  }
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
