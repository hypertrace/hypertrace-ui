import { TableCellParser, TableCellParserBase } from '@hypertrace/components';
import { TraceStatus } from '../../../../graphql/model/schema/trace';
import { TracingTableCellType } from '../../tracing-table-cell-type';

@TableCellParser({
  type: TracingTableCellType.TraceStatus
})
export class TraceStatusTableCellParser extends TableCellParserBase<TraceStatus, TraceStatus, string> {
  public parseValue(cellData: TraceStatus): TraceStatus {
    return cellData;
  }

  public parseFilterValue(cellData: TraceStatus): string {
    return cellData.statusCode;
  }
}
