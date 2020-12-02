import { TableDataSource, TableMode, TableRow, TableSelectionMode, TableStyle } from '@hypertrace/components';
import {
  ArrayPropertyTypeInstance,
  EnumPropertyTypeInstance,
  ENUM_TYPE,
  WidgetHeaderModel
} from '@hypertrace/dashboards';
import {
  ARRAY_PROPERTY,
  BOOLEAN_PROPERTY,
  ModelApi,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { TableWidgetRowSelectionModel } from './selections/table-widget-row-selection.model';
import { TableWidgetCheckboxFilterModel } from './table-widget-checkbox-filter-model';
import { SpecificationBackedTableColumnDef } from './table-widget-column.model';
import { TableWidgetFilterModel } from './table-widget-filter-model';
export abstract class TableWidgetBaseModel {
  @ModelProperty({
    key: 'title',
    displayName: 'Title',
    type: STRING_PROPERTY.type
  })
  // @deprecated
  public title?: string;

  @ModelProperty({
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: WidgetHeaderModel
    } as ModelModelPropertyTypeInstance,
    key: 'header'
  })
  public header!: WidgetHeaderModel;

  @ModelProperty({
    key: 'searchAttribute',
    displayName: 'Search Attribute',
    type: STRING_PROPERTY.type
  })
  public searchAttribute?: string;

  @ModelProperty({
    key: 'filterOptions',
    displayName: 'Filter Toggle Options',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ARRAY_PROPERTY.type,
      subtype: {
        key: ModelPropertyType.TYPE,
        defaultModelClass: TableWidgetFilterModel
      }
    } as ArrayPropertyTypeInstance
  })
  public filterOptions: TableWidgetFilterModel[] = [];

  @ModelProperty({
    key: 'checkbox-filter-option',
    displayName: 'Checkbox Filter Option',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: TableWidgetCheckboxFilterModel
    } as ModelModelPropertyTypeInstance,
    required: false
  })
  public checkboxFilterOption?: TableWidgetCheckboxFilterModel;

  @ModelProperty({
    key: 'mode',
    displayName: 'Table Mode',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [TableMode.Flat, TableMode.Tree, TableMode.Detail]
    } as EnumPropertyTypeInstance
  })
  public mode: TableMode = TableMode.Flat;

  @ModelProperty({
    key: 'style',
    displayName: 'Table Style',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [TableStyle.FullPage, TableStyle.Embedded, TableStyle.List]
    } as EnumPropertyTypeInstance
  })
  public style: TableStyle = TableStyle.Embedded;

  @ModelProperty({
    key: 'pageable',
    displayName: 'Pageable',
    type: BOOLEAN_PROPERTY.type
  })
  public pageable: boolean = true;

  @ModelInject(MODEL_API)
  protected readonly api!: ModelApi;

  public abstract getColumns(scope?: string): Observable<SpecificationBackedTableColumnDef[]>;
  public abstract getChildModel(row: TableRow): object | undefined;

  public getData(): Observable<TableDataSource<TableRow>> {
    return this.api.getData<TableDataSource<TableRow>>();
  }

  public getRowSelectionHandlers(_row: TableRow): TableWidgetRowSelectionModel[] {
    // No-op here, but can be overridden
    return [];
  }

  public getSelectionMode(): TableSelectionMode {
    // No-op here, but can be overridden
    return TableSelectionMode.Single;
  }

  public setMode(_mode: TableMode): void {
    // No-op here, but can be overridden
    return;
  }

  public getModeOptions(): TableMode[] {
    // No-op here, but can be overridden
    return [];
  }

  public getFilterOptions(): TableWidgetFilterModel[] {
    return this.filterOptions;
  }

  public getCheckboxFilterOption(): TableWidgetCheckboxFilterModel | undefined {
    return this.checkboxFilterOption;
  }

  public isPageable(): boolean {
    return this.pageable;
  }
}
