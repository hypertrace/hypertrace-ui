import { Injectable, Type } from '@angular/core';
import { TableCellCsvGeneratorBase } from './table-cell-csv-generator-base';
import { CoreTableCellCsvGeneratorType } from './types/core-table-cell-csv-generator-type';

@Injectable({
  providedIn: 'root'
})
export class TableCellCsvGeneratorLookupService {
  private readonly csvGenerator: Map<string, TableCellCsvGeneratorConstructor<unknown, unknown>> = new Map();

  public register(...csvGenerators: TableCellCsvGeneratorConstructor<unknown, unknown>[]): void {
    csvGenerators.forEach(csvGenerator => {
      this.csvGenerator.set(csvGenerator.type, csvGenerator);
    });
  }

  public lookup<C, R>(type: string): TableCellCsvGeneratorConstructor<C, R> {
    if (!this.csvGenerator.has(type)) {
      throw Error(`Table cell csv generator of type '${type}' not registered.`);
    }

    return this.csvGenerator.get(type)! as TableCellCsvGeneratorConstructor<C, R>;
  }
}

/*
 * TableCellRendererConstructor is used by lookup service to dynamically instantiate cell CsvGenerators
 */
export interface TableCellCsvGeneratorConstructor<TCellData, TRowValue>
  extends Type<TableCellCsvGeneratorBase<TCellData, TRowValue>>,
    TableCellCsvGeneratorMetadata {}

/*
 * @TableCellCsvGenerator decorator is used to configure type for cell CsvGenerators
 */

export function TableCellCsvGenerator(
  tableCellCsvGeneratorMetadata: TableCellCsvGeneratorMetadata
): TableCellCsvGeneratorDecorator {
  return (constructor: TableCellCsvGeneratorConstructor<unknown, unknown>): void => {
    constructor.type = tableCellCsvGeneratorMetadata.type;
  };
}

type TableCellCsvGeneratorDecorator = (constructor: TableCellCsvGeneratorConstructor<unknown, unknown>) => void;

export interface TableCellCsvGeneratorMetadata {
  type: CoreTableCellCsvGeneratorType | string;
}
