import { TableCellParser, TableCellParserBase } from '@hypertrace/components';
import { SpanNameCellData } from './span-name-cell-data';
import { WaterfallTableCellType } from './span-name-cell-type';

@TableCellParser({
  type: WaterfallTableCellType.SpanName
})
export class SpanNameTableCellParser extends TableCellParserBase<
  SpanNameCellData,
  SpanNameCellData,
  SpanNameCellData | undefined
> {
  public parseValue(cellData: SpanNameCellData): SpanNameCellData {
    return cellData;
  }

  public parseTooltip(cellData: SpanNameCellData): string {
    return `${cellData.serviceName} ${cellData.protocolName ?? ''} ${cellData.apiName ?? ''}`.trim();
  }

  public parseFilterValue(): SpanNameCellData | undefined {
    return undefined;
  }
}
