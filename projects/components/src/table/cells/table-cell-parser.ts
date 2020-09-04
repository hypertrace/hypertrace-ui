import { Type } from '@angular/core';
import { TableCellParserBase } from './table-cell-parser-base';
import { CoreTableCellParserType } from './types/core-table-cell-parser-type';

/*
 * TableCellRendererConstructor is used by lookup service to dynamically instantiate cell parsers
 */
export interface TableCellParserConstructor<TCellData, TValue, TFilterValue>
  extends Type<TableCellParserBase<TCellData, TValue, TFilterValue>>,
    TableCellParserMetadata {}

/*
 * @TableCellParser decorator is used to configure type for cell parsers
 */
// tslint:disable-next-line:only-arrow-functions
export function TableCellParser(tableCellParserMetadata: TableCellParserMetadata): TableCellParserDecorator {
  return (constructor: TableCellParserConstructor<unknown, unknown, unknown>): void => {
    constructor.type = tableCellParserMetadata.type;
  };
}

type TableCellParserDecorator = (constructor: TableCellParserConstructor<unknown, unknown, unknown>) => void;

export interface TableCellParserMetadata {
  type: CoreTableCellParserType | string;
}
