import { TableCellCsvGenerator } from '../table-cell-csv-generator';
import { Injectable } from '@angular/core';
import { CoreTableCellRendererType } from '../types/core-table-cell-renderer-type';
import { DisplayStringEnumPipe } from '@hypertrace/common';
import { isNil } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class TableCellStringEnumCsvGenerator implements TableCellCsvGenerator<string> {
  public cellType: string = CoreTableCellRendererType.StringEnum;

  private readonly stringEnumPipe = new DisplayStringEnumPipe();

  public generateSafeCsv(cellData: string | null | undefined): string | undefined {
    return isNil(cellData) ? undefined : this.stringEnumPipe.transform(cellData);
  }
}
