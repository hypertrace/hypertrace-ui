import { TableDataSource, TableMode, TableRow, TableSelectionMode, TableStyle } from '@hypertrace/components';
import {
  ArrayPropertyTypeInstance,
  BaseModel,
  EnumPropertyTypeInstance,
  ENUM_TYPE,
  ModelTemplatePropertyType,
  WidgetHeaderModel
} from '@hypertrace/dashboards';
import {
  ARRAY_PROPERTY,
  BOOLEAN_PROPERTY,
  ModelApi,
  ModelJson,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { TableWidgetRowSelectionModel } from './selections/table-widget-row-selection.model';
import { SpecificationBackedTableColumnDef } from './table-widget-column.model';
import { TableWidgetControlCheckboxOptionModel } from './table-widget-control-checkbox-option.model';
import { TableWidgetControlSelectOptionModel } from './table-widget-control-select-option.model';

export abstract class TableWidgetBaseModel extends BaseModel {
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
    key: 'search-placeholder',
    displayName: 'Search Placeholder',
    type: STRING_PROPERTY.type
  })
  public searchPlaceholder?: string;

  @ModelProperty({
    key: 'select-control-options',
    displayName: 'Select Options',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ARRAY_PROPERTY.type,
      subtype: {
        key: ModelPropertyType.TYPE,
        defaultModelClass: TableWidgetControlSelectOptionModel
      }
    } as ArrayPropertyTypeInstance
  })
  public selectOptions: TableWidgetControlSelectOptionModel[] = [];

  @ModelProperty({
    key: 'checkbox-control-options',
    displayName: 'Checkbox Options',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ARRAY_PROPERTY.type,
      subtype: {
        key: ModelPropertyType.TYPE,
        defaultModelClass: TableWidgetControlCheckboxOptionModel
      }
    } as ArrayPropertyTypeInstance
  })
  public checkboxOptions: TableWidgetControlCheckboxOptionModel[] = [];

  @ModelProperty({
    key: 'custom-control-widget',
    type: ModelTemplatePropertyType.TYPE
  })
  public customControlModelJson?: ModelJson;

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

  @ModelProperty({
    key: 'resizable',
    displayName: 'Resizable',
    type: BOOLEAN_PROPERTY.type
  })
  public resizable: boolean = true;

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

  public setView(_view: string): void {
    // No-op here, but can be overridden
    return;
  }

  public getViewOptions(): string[] {
    // No-op here, but can be overridden
    return [];
  }

  public abstract getCustomControlWidgetModel(selectedRows?: TableRow[]): object | undefined;

  public getSearchAttribute(): string | undefined {
    return this.searchAttribute;
  }

  public getSearchPlaceholder(): string | undefined {
    return this.searchPlaceholder;
  }

  public getSelectControlOptions(): TableWidgetControlSelectOptionModel[] {
    return this.selectOptions;
  }

  public getCheckboxControlOptions(): TableWidgetControlCheckboxOptionModel[] {
    return this.checkboxOptions;
  }

  public setCheckboxControlOptions(checkboxOptions: TableWidgetControlCheckboxOptionModel[]): void {
    this.checkboxOptions = checkboxOptions;
  }

  public isPageable(): boolean {
    return this.pageable;
  }

  public isResizable(): boolean {
    return this.resizable;
  }
}
