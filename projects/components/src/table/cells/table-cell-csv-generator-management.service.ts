import { Injectable } from '@angular/core';
import { TableCellCsvGenerator } from './table-cell-csv-generator';
import { isArray, isUndefined } from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class TableCellCsvGeneratorManagementService {
  private readonly csvGenerators: TableCellCsvGenerator<unknown>[] = [];

  public register(csvGenerators: TableCellCsvGenerator<unknown> | TableCellCsvGenerator<unknown>[]): void {
    isArray(csvGenerators) ? csvGenerators.forEach(item => this.addGenerator(item)) : this.addGenerator(csvGenerators);
  }

  private addGenerator(csvGenerator: TableCellCsvGenerator<unknown>): void {
    if (!isUndefined(this.findMatchingGenerator(csvGenerator.cellType))) {
      this.csvGenerators.push(csvGenerator);
    }
  }

  public findMatchingGenerator(type?: string): TableCellCsvGenerator<unknown> | undefined {
    return this.csvGenerators.find(generator => generator.cellType === type);
  }
}
