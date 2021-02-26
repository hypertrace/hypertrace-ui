import { TableCellParser, TableCellParserBase } from '@hypertrace/components';
import { MetricAggregation } from '@hypertrace/distributed-tracing';
import { ObservabilityTableCellType } from '../../observability-table-cell-type';

@TableCellParser({
  type: ObservabilityTableCellType.ExploreValue
})
export class ExploreValueTableCellParser extends TableCellParserBase<number, CellValue, CellValue> {
  public parseValue(cellData: CellData): CellValue {
    return this.extractValue(cellData);
  }

  public parseFilterValue(cellData: number): CellValue {
    return this.parseValue(cellData);
  }

  public parseUnits(cellData: CellData): string {
    return this.extractUnits(cellData)!;
  }

  private extractValue(cellData: CellData): CellValue {
    switch (typeof cellData) {
      case 'object':
        return cellData?.value ?? undefined;
      default:
        return undefined;
    }
  }

  private extractUnits(cellData: CellData): string | undefined {
    switch (typeof cellData) {
      case 'object':
        return cellData?.units ?? undefined;
      default:
        return undefined;
    }
  }
}

type CellData = number | string | null | Partial<NullableValueMetricAggregation>;
type CellValue = number | string | undefined;

interface NullableValueMetricAggregation extends Omit<MetricAggregation, 'value'> {
  value: number | string | null;
}
