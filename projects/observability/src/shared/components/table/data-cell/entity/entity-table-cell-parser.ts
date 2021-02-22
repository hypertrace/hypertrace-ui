import { TableCellParser, TableCellParserBase, TableRow } from '@hypertrace/components';
import { Entity, entityIdKey } from '../../../../graphql/model/schema/entity';
import { ObservabilityTableCellType } from '../../observability-table-cell-type';
import { parseEntityFromTableRow } from './entity-table-cell-renderer-util';

@TableCellParser({
  type: ObservabilityTableCellType.Entity
})
export class EntityTableCellParser extends TableCellParserBase<CellData, CellData, string | undefined> {
  public parseValue(cellData: CellData, row: TableRow): CellData {
    return parseEntityFromTableRow(cellData, row);
  }

  public parseFilterValue(cellData: CellData): string | undefined {
    return cellData !== undefined ? cellData[entityIdKey] : undefined;
  }
}

type CellData = Entity | undefined;
