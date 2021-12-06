import { Injector } from '@angular/core';
import { TableCellParser, TableCellParserBase } from '@hypertrace/components';
import { EntityIconLookupService } from '../../../../services/entity/entity-icon-lookup.service';
import { ObservabilityTableCellType } from '../../observability-table-cell-type';

@TableCellParser({
  type: ObservabilityTableCellType.BackendIcon
})
export class BackendIconTableCellParser extends TableCellParserBase<string, string, string> {
  public constructor(protected readonly rootInjector: Injector) {
    super(rootInjector);
  }

  public parseValue(cellData: string): string {
    return this.rootInjector.get(EntityIconLookupService).forBackendType(cellData);
  }

  public parseFilterValue(cellData: string): string {
    return cellData;
  }
}
