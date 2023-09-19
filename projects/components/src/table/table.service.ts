import { Injectable, Injector } from '@angular/core';
import { FilterAttribute } from '../filtering/filter/filter-attribute';
import { FilterAttributeType } from '../filtering/filter/filter-attribute-type';
import { TableCellParserBase } from './cells/table-cell-parser-base';
import { TableCellParserLookupService } from './cells/table-cell-parser-lookup.service';
import { TableCellRendererConstructor } from './cells/table-cell-renderer';
import { TableCellRendererLookupService } from './cells/table-cell-renderer-lookup.service';
import { CoreTableCellRendererType } from './cells/types/core-table-cell-renderer-type';
import { TableCdkDataSource } from './data/table-cdk-data-source';
import { TableColumnConfig } from './table-api';
import { TableCellCsvGeneratorLookupService } from './cells/table-cell-csv-generator-lookup.service';
import { CoreTableCellCsvGeneratorType } from './cells/types/core-table-cell-csv-generator-type';
import { TableCellCsvGeneratorBase } from './cells/table-cell-csv-generator-base';

export interface TableColumnConfigExtended extends TableColumnConfig {
  attribute?: FilterAttribute; // Undefined if we can't determine scope yet (e.g. Interactions)
  renderer: TableCellRendererConstructor;
  parser: TableCellParserBase<unknown, unknown, unknown>;
  csvGenerator?: TableCellCsvGeneratorBase<unknown>;
  filterValues: unknown[];
}

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private static readonly STATE_ATTRIBUTE: FilterAttribute = {
    name: '$$state',
    displayName: 'Row State',
    type: '$$state' as FilterAttributeType
  };

  public constructor(
    private readonly rootInjector: Injector,
    private readonly tableCellRendererLookupService: TableCellRendererLookupService,
    private readonly tableCellParserLookupService: TableCellParserLookupService,
    private readonly tableCellCsvGeneratorLookupService: TableCellCsvGeneratorLookupService
  ) {}

  public buildExtendedColumnConfigs(
    columnConfigs: TableColumnConfig[],
    dataSource?: TableCdkDataSource,
    attributes: FilterAttribute[] = []
  ): TableColumnConfigExtended[] {
    return columnConfigs.map(columnConfig => {
      const attribute = this.isStateColumnConfig(columnConfig)
        ? TableService.STATE_ATTRIBUTE
        : attributes.find(attr => attr.name === columnConfig.name);
      const rendererConstructor = this.tableCellRendererLookupService.lookup(
        columnConfig.display !== undefined ? columnConfig.display : CoreTableCellRendererType.Text
      );
      const csvGeneratorConstructor = this.tableCellCsvGeneratorLookupService.lookup(
        columnConfig.csv ?? CoreTableCellCsvGeneratorType.Skip
      );

      const parserConstructor = this.tableCellParserLookupService.lookup(rendererConstructor.parser);

      return {
        ...columnConfig,
        attribute: attribute,
        renderer: rendererConstructor,
        parser: new parserConstructor(this.rootInjector),
        filterValues: dataSource?.getFilterValues(columnConfig.id) ?? [],
        csvGenerator: new csvGeneratorConstructor(this.rootInjector)
      };
    });
  }

  public updateFilterValues(columnConfigs: TableColumnConfigExtended[], dataSource: TableCdkDataSource): void {
    columnConfigs.forEach(columnConfig => (columnConfig.filterValues = dataSource.getFilterValues(columnConfig.id)));
  }

  private isStateColumnConfig(columnConfig: TableColumnConfig): boolean {
    return columnConfig.id === '$$state';
  }
}
