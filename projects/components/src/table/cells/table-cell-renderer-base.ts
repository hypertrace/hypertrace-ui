import { Directive, Inject, OnInit } from '@angular/core';
import { TableColumnConfig, TableRow } from '../table-api';
import {
  TABLE_CELL_DATA,
  TABLE_COLUMN_CONFIG,
  TABLE_COLUMN_INDEX,
  TABLE_DATA_PARSER,
  TABLE_ROW_DATA
} from './table-cell-injection';
import { TableCellParserBase } from './table-cell-parser-base';
import { CoreTableCellParserType } from './types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from './types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from './types/table-cell-alignment-type';

@Directive() // Angular 9 Requires superclasses to be annotated as well in order to resolve injectables for constructor
// tslint:disable-next-line:directive-class-suffix
export abstract class TableCellRendererBase<TCellData, TValue = TCellData> implements OnInit {
  public static readonly type: CoreTableCellRendererType;
  public static readonly alignment: TableCellAlignmentType;
  public static readonly parser: CoreTableCellParserType;

  private _value!: TValue;
  private _units!: string;
  private _tooltip!: string;
  public readonly clickable: boolean = false;
  public readonly isFirstColumn: boolean = false;

  public constructor(
    @Inject(TABLE_COLUMN_CONFIG) private readonly columnConfig: TableColumnConfig,
    @Inject(TABLE_COLUMN_INDEX) private readonly index: number,
    @Inject(TABLE_DATA_PARSER) private readonly parser: TableCellParserBase<TCellData, TValue, unknown>,
    @Inject(TABLE_CELL_DATA) private readonly cellData: TCellData,
    @Inject(TABLE_ROW_DATA) private readonly rowData: TableRow
  ) {
    this.clickable = this.columnConfig.onClick !== undefined;
    this.isFirstColumn = this.index === 0;
  }

  public ngOnInit(): void {
    this._value = this.parser.parseValue(this.cellData, this.rowData);
    this._units = this.parser.parseUnits(this.cellData, this.rowData);
    this._tooltip = this.parser.parseTooltip(this.cellData, this.rowData);
  }

  public get value(): TValue {
    return this._value;
  }

  public get units(): string {
    return this._units;
  }

  public get tooltip(): string {
    return this._tooltip;
  }
}
