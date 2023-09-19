import { Type } from '@angular/core';
import { TableCellRendererBase } from './table-cell-renderer-base';
import { CoreTableCellParserType } from './types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from './types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from './types/table-cell-alignment-type';
import { CoreTableCellCsvGeneratorType } from './types/core-table-cell-csv-generator-type';

/*
 * TableCellRendererConstructor is used by lookup service to dynamically instantiate cell renderers
 */
export interface TableCellRendererConstructor
  extends Type<TableCellRendererBase<unknown, unknown>>,
    TableCellRendererMetadata {}

/*
 * @TableCellRenderer decorator is used to configure type, alignment, parser for cell renderers
 */

export function TableCellRenderer(tableCellRendererMetadata: TableCellRendererMetadata): TableCellRendererDecorator {
  return (constructor: TableCellRendererConstructor): void => {
    constructor.type = tableCellRendererMetadata.type;
    constructor.alignment = tableCellRendererMetadata.alignment;
    constructor.parser = tableCellRendererMetadata.parser;
    constructor.csvGenerator = tableCellRendererMetadata.csvGenerator;
  };
}

type TableCellRendererDecorator = (constructor: TableCellRendererConstructor) => void;

export interface TableCellRendererMetadata {
  type: CoreTableCellRendererType | string;
  alignment: TableCellAlignmentType;
  parser: CoreTableCellParserType | string;
  csvGenerator?: CoreTableCellCsvGeneratorType | string;
}
