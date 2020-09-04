import { TableCellParser, TableCellParserBase } from '@hypertrace/components';
import { MetricAggregation } from '../../../../graphql/model/metrics/metric-aggregation';
import { TracingTableCellType } from '../../tracing-table-cell-type';

@TableCellParser({
  type: TracingTableCellType.Metric
})
export class MetricTableCellParser extends TableCellParserBase<number, number, number> {
  public parseValue(cellData: CellData): number {
    return Math.round(this.extractValue(cellData)!);
  }

  public parseFilterValue(cellData: number): number {
    return this.parseValue(cellData);
  }

  public parseUnits(cellData: CellData): string {
    return this.extractUnits(cellData)!;
  }

  private extractValue(cellData: CellData): number | undefined {
    switch (typeof cellData) {
      case 'number':
        return cellData;
      case 'object':
        return cellData.value;
      default:
        return undefined;
    }
  }

  private extractUnits(cellData: CellData): string | undefined {
    switch (typeof cellData) {
      case 'number':
        return undefined;
      case 'object':
        return cellData.units;
      default:
        return undefined;
    }
  }
}

type CellData = number | Partial<MetricAggregation>;
