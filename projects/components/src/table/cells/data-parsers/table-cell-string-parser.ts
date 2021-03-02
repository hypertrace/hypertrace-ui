import { MetricAggregation } from '@hypertrace/distributed-tracing';
import { TableCellParser } from '../table-cell-parser';
import { TableCellParserBase } from '../table-cell-parser-base';
import { CoreTableCellParserType } from '../types/core-table-cell-parser-type';

@TableCellParser({
  type: CoreTableCellParserType.String
})
export class TableCellStringParser extends TableCellParserBase<string, CellValue, CellValue> {
  public parseValue(cellData: CellData): CellValue {
    return this.extractValue(cellData);
  }

  private extractValue(cellData: CellData): CellValue {
    switch (typeof cellData) {
      case 'object':
        return cellData?.value ?? undefined;
      case 'string':
      default:
        return cellData;
    }
  }

  public parseFilterValue(cellData: string): CellValue {
    return this.parseValue(cellData);
  }
}

type CellData = string | null | Partial<NullableValueMetricAggregation>;
type CellValue = string | undefined;

interface NullableValueMetricAggregation extends Omit<MetricAggregation, 'value'> {
  value: string | null;
}
