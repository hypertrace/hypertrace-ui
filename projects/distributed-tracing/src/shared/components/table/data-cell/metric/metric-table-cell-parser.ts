import { TableCellParser, TableCellParserBase } from '@hypertrace/components';
import { MetricAggregation } from '../../../../graphql/model/metrics/metric-aggregation';
import { TracingTableCellType } from '../../tracing-table-cell-type';

@TableCellParser({
  type: TracingTableCellType.Metric
})
export class MetricTableCellParser extends TableCellParserBase<number, number | null, number | null> {
  public parseValue(cellData: CellData): number | null {
    const extractedValue = this.extractValue(cellData);

    return extractedValue === null ? extractedValue : Math.round(this.extractValue(cellData)!);
  }

  public parseFilterValue(cellData: number): number | null {
    return this.parseValue(cellData);
  }

  public parseUnits(cellData: CellData): string {
    return this.extractUnits(cellData)!;
  }

  // tslint:disable-next-line:no-null-undefined-union
  private extractValue(cellData: CellData): number | undefined | null {
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
