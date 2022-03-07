import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { Inject, InjectionToken, NgModule } from '@angular/core';
import { FormattingModule } from '@hypertrace/common';
import { TraceCheckboxModule } from '../../checkbox/checkbox.module';
import { CopyToClipboardModule } from '../../copy-to-clipboard/copy-to-clipboard.module';
import { ExpanderToggleModule } from '../../expander/expander-toggle.module';
import { FilterButtonModule } from '../../filtering/filter-button/filter-button.module';
import { FilterModalModule } from '../../filtering/filter-modal/filter-modal.module';
import { IconModule } from '../../icon/icon.module';
import { PopoverModule } from '../../popover/popover.module';
import { XMoreModule } from '../../public-api';
import { TooltipModule } from '../../tooltip/tooltip.module';
import { TableHeaderCellRendererComponent } from '../header/table-header-cell-renderer.component';
import { TableCellBooleanParser } from './data-parsers/table-cell-boolean-parser';
import { TableCellIconParser } from './data-parsers/table-cell-icon-parser';
import { TableCellNoOpParser } from './data-parsers/table-cell-no-op-parser';
import { TableCellNumberParser } from './data-parsers/table-cell-number-parser';
import { TableCellStringParser } from './data-parsers/table-cell-string-parser';
import { TableCellTimestampParser } from './data-parsers/table-cell-timestamp-parser';
import { CodeTableCellRendererComponent } from './data-renderers/code/code-table-cell-renderer.component';
import { StringEnumTableCellRendererComponent } from './data-renderers/enum/string-enum-table-cell-renderer.component';
import { IconTableCellRendererComponent } from './data-renderers/icon/icon-table-cell-renderer.component';
import { NumericTableCellRendererComponent } from './data-renderers/numeric/numeric-table-cell-renderer.component';
import { RelativeTimestampTableCellRendererComponent } from './data-renderers/relative-timestamp/relative-timestamp-table-cell-renderer.component';
import { StringArrayWithXMoreTableCellRendererComponent } from './data-renderers/string-array-with-x-more-table-cell-renderer/string-array-with-x-more-table-cell-renderer.component';
import { TableDataCellRendererComponent } from './data-renderers/table-data-cell-renderer.component';
import { TextWithCopyActionTableCellRendererComponent } from './data-renderers/text-with-copy/text-with-copy-table-cell-renderer.component';
import { TextTableCellRendererComponent } from './data-renderers/text/text-table-cell-renderer.component';
import { TimeAgoTableCellRendererComponent } from './data-renderers/time-ago/time-ago-table-cell-renderer.component';
import { TimestampTableCellRendererComponent } from './data-renderers/timestamp/timestamp-table-cell-renderer.component';
import { TableExpandedDetailRowCellRendererComponent } from './expanded-detail/table-expanded-detail-row-cell-renderer.component';
import { TableCellStateParser } from './state-parsers/table-cell-state-parser';
import { TableCheckboxCellRendererComponent } from './state-renderers/checkbox/table-checkbox-cell-renderer.component';
import { TableExpanderCellRendererComponent } from './state-renderers/expander/table-expander-cell-renderer.component';
import { TableCellParserConstructor } from './table-cell-parser';
import { TableCellParserLookupService } from './table-cell-parser-lookup.service';
import { TableCellRendererConstructor } from './table-cell-renderer';
import { TableCellRendererLookupService } from './table-cell-renderer-lookup.service';

export const TABLE_CELL_RENDERERS = new InjectionToken<unknown[][]>('TABLE_CELL_RENDERERS');
export const TABLE_CELL_PARSERS = new InjectionToken<unknown[][]>('TABLE_CELL_PARSERS');

@NgModule({
  imports: [
    CommonModule,
    CdkTableModule,
    ExpanderToggleModule,
    FormattingModule,
    IconModule,
    TooltipModule,
    TraceCheckboxModule,
    FilterButtonModule,
    FilterModalModule,
    PopoverModule,
    CopyToClipboardModule,
    XMoreModule,
  ],
  exports: [
    TableHeaderCellRendererComponent,
    TableDataCellRendererComponent,
    TableExpandedDetailRowCellRendererComponent
  ],
  declarations: [
    IconTableCellRendererComponent,
    NumericTableCellRendererComponent,
    TableCheckboxCellRendererComponent,
    TableDataCellRendererComponent,
    TableExpandedDetailRowCellRendererComponent,
    TableExpanderCellRendererComponent,
    TableHeaderCellRendererComponent,
    TextTableCellRendererComponent,
    TimestampTableCellRendererComponent,
    TimeAgoTableCellRendererComponent,
    CodeTableCellRendererComponent,
    StringArrayWithXMoreTableCellRendererComponent,
    StringEnumTableCellRendererComponent,
    TextWithCopyActionTableCellRendererComponent,
    RelativeTimestampTableCellRendererComponent
  ],
  providers: [
    {
      provide: TABLE_CELL_RENDERERS,
      useValue: [
        IconTableCellRendererComponent,
        NumericTableCellRendererComponent,
        TableCheckboxCellRendererComponent,
        TableExpanderCellRendererComponent,
        TextTableCellRendererComponent,
        TimestampTableCellRendererComponent,
        TimeAgoTableCellRendererComponent,
        CodeTableCellRendererComponent,
        StringArrayWithXMoreTableCellRendererComponent,
        StringEnumTableCellRendererComponent,
        TextWithCopyActionTableCellRendererComponent,
        RelativeTimestampTableCellRendererComponent
      ],
      multi: true
    },
    {
      provide: TABLE_CELL_PARSERS,
      useValue: [
        TableCellStateParser,
        TableCellBooleanParser,
        TableCellIconParser,
        TableCellNumberParser,
        TableCellStringParser,
        TableCellTimestampParser,
        TableCellNoOpParser
      ],
      multi: true
    }
  ]
})
export class TableCellsModule {
  public constructor(
    private readonly tableCellParserLookupService: TableCellParserLookupService,
    private readonly tableCellRendererLookupService: TableCellRendererLookupService,
    @Inject(TABLE_CELL_PARSERS) cellParsers: TableCellParserConstructor<unknown, unknown, unknown>[][],
    @Inject(TABLE_CELL_RENDERERS) cellRenderers: TableCellRendererConstructor[][]
  ) {
    this.registerAllParsers(cellParsers.flat());
    this.registerAllRenderers(cellRenderers.flat());
  }

  private registerAllParsers(cellParsers: TableCellParserConstructor<unknown, unknown, unknown>[] = []): void {
    this.tableCellParserLookupService.register(...cellParsers);
  }

  private registerAllRenderers(cellRenderers: TableCellRendererConstructor[] = []): void {
    this.tableCellRendererLookupService.registerAll(cellRenderers, TextTableCellRendererComponent);
  }
}
