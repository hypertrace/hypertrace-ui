import { TableCellParser, TableCellParserBase } from '@hypertrace/components';
import { MetricAggregation } from '../../../../graphql/model/metrics/metric-aggregation';
import { TracingTableCellType } from '../../tracing-table-cell-type';

@TableCellParser({
  type: TracingTableCellType.Metric
})
export class MetricTableCellParser extends TableCellParserBase<number, CellValue, CellValue> {
  public parseValue(cellData: CellData): CellValue {
    const extractedValue = this.extractValue(cellData);

    return extractedValue === undefined ? extractedValue : Math.round(extractedValue);
  }

  public parseFilterValue(cellData: number): CellValue {
    return this.parseValue(cellData);
  }

  public parseUnits(cellData: CellData): string {
    return this.extractUnits(cellData)!;
  }

  private extractValue(cellData: CellData): CellValue {
    switch (typeof cellData) {
      case 'number':
        return cellData;
      case 'object':
        return cellData === null ? undefined : cellData.value === null ? undefined : cellData.value;
      default:
        return undefined;
    }
  }

  private extractUnits(cellData: CellData): string | undefined {
    switch (typeof cellData) {
      case 'number':
        return undefined;
      case 'object':
        return cellData === null ? undefined : cellData.units;
      default:
        return undefined;
    }
  }
}

type CellData = number | null | Partial<NullableValueMetricAggregation>;
type CellValue = number | undefined;

interface NullableValueMetricAggregation extends Omit<MetricAggregation, 'value'> {
  value: number | null;
}
