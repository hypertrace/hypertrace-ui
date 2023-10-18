import { Injectable, Type } from '@angular/core';
import { TableCellCsvGeneratorBase } from './table-cell-csv-generator-base';
import { CoreTableCellCsvGeneratorType } from './types/core-table-cell-csv-generator-type';
import { includes, isArray } from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class TableCellCsvGeneratorManagementService {
  private readonly csvGenerators: TableCellCsvGeneratorBase<unknown>[] = [];

  public register(csvGenerators: TableCellCsvGeneratorBase<unknown> | TableCellCsvGeneratorBase<unknown>[]): void {
    isArray(csvGenerators) ? csvGenerators.forEach(item => this.addGenerator(item)) : this.addGenerator(csvGenerators);
  }

  private addGenerator(csvGenerator: TableCellCsvGeneratorBase<unknown>): void {
    if (!includes(this.csvGenerators, csvGenerator)) {
      this.csvGenerators.push(csvGenerator);
    }
  }

  public findMatchingGenerator(type?: string): TableCellCsvGeneratorBase<unknown> | undefined {
    return this.csvGenerators.find(generator => generator.cellType === type);
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
