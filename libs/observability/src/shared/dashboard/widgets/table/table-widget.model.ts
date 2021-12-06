import { forkJoinSafeEmpty } from '@hypertrace/common';
import { TableDataSource, TableMode, TableRow, TableSelectionMode } from '@hypertrace/components';
import {
  ArrayPropertyTypeInstance,
  EnumPropertyTypeInstance,
  ENUM_TYPE,
  ModelTemplatePropertyType
} from '@hypertrace/dashboards';
import {
  ARRAY_PROPERTY,
  BOOLEAN_PROPERTY,
  Model,
  ModelJson,
  ModelProperty,
  ModelPropertyType
} from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { InteractionHandler } from '../../interaction/interaction-handler';
import { TableWidgetRowInteractionModel } from './selections/table-widget-row-interaction.model';
import { TableWidgetColumnsService } from './services/table-widget-columns.service';
import { TableWidgetBaseModel } from './table-widget-base.model';
import { SpecificationBackedTableColumnDef, TableWidgetColumnModel } from './table-widget-column.model';

@Model({
  type: 'table-widget',
  displayName: 'Table Widget'
})
export class TableWidgetModel extends TableWidgetBaseModel {
  @ModelProperty({
    key: 'columns',
    displayName: 'Columns',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ARRAY_PROPERTY.type,
      subtype: {
        key: ModelPropertyType.TYPE,
        defaultModelClass: TableWidgetColumnModel
      }
    } as ArrayPropertyTypeInstance
  })
  public columns: TableWidgetColumnModel[] = [];

  @ModelProperty({
    key: 'selection-mode',
    displayName: 'Table Selection Mode',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [TableSelectionMode.None, TableSelectionMode.Single, TableSelectionMode.Multiple]
    } as EnumPropertyTypeInstance
  })
  public selectionMode: TableSelectionMode = TableSelectionMode.Single;

  /**
   * Deprecated. Use rowSelectionHandlers instead
   */
  @ModelProperty({
    key: 'selection-handler',
    displayName: 'Row selection Handler',
    type: ModelPropertyType.TYPE
  })
  public selectionHandler?: InteractionHandler;

  @ModelProperty({
    key: 'row-click-handlers',
    displayName: 'Row click Handlers',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ARRAY_PROPERTY.type,
      subtype: {
        key: ModelPropertyType.TYPE,
        defaultModelClass: TableWidgetRowInteractionModel
      }
    } as ArrayPropertyTypeInstance
  })
  public rowClickHandlers?: TableWidgetRowInteractionModel[];

  @ModelProperty({
    key: 'row-selection-handlers',
    displayName: 'Row selection handlers',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ARRAY_PROPERTY.type,
      subtype: {
        key: ModelPropertyType.TYPE,
        defaultModelClass: TableWidgetRowInteractionModel
      }
    } as ArrayPropertyTypeInstance
  })
  public rowSelectionHandlers?: TableWidgetRowInteractionModel[];

  @ModelProperty({
    key: 'child-template',
    type: ModelTemplatePropertyType.TYPE
  })
  public childTemplate?: ModelJson;

  @ModelProperty({
    key: 'custom-control-widget',
    type: ModelTemplatePropertyType.TYPE
  })
  public customControlModelJson?: ModelJson;

  @ModelProperty({
    key: 'fetchEditableColumns',
    displayName: 'Query for additional columns not provided',
    type: BOOLEAN_PROPERTY.type
  })
  public fetchEditableColumns: boolean = false;

  @ModelInject(TableWidgetColumnsService)
  private readonly tableWidgetColumnsService!: TableWidgetColumnsService;

  public getId(): string | undefined {
    return this.id;
  }

  public getData(): Observable<TableDataSource<TableRow>> {
    return this.api.getData<TableDataSource<TableRow>>();
  }

  public getRowClickHandlers(): TableWidgetRowInteractionModel[] {
    return this.rowClickHandlers ?? [];
  }

  public getRowSelectionHandlers(_row: TableRow): TableWidgetRowInteractionModel[] {
    return this.rowSelectionHandlers ?? [];
  }

  public getSelectionMode(): TableSelectionMode {
    return this.selectionMode;
  }

  public isCustomControlPresent(): boolean {
    return !!this.customControlModelJson;
  }

  public getCustomControlWidgetModel(selectedRows?: TableRow[]): object | undefined {
    if (this.customControlModelJson) {
      const childModel = this.api.createChild<object>(this.customControlModelJson, this);
      this.api.setVariable('selectedRows', selectedRows, childModel);

      return childModel;
    }

    return undefined;
  }

  public getColumns(scope?: string): Observable<SpecificationBackedTableColumnDef[]> {
    const modelColumns: Observable<SpecificationBackedTableColumnDef[]> = forkJoinSafeEmpty(
      this.columns.map(column => column.asTableColumnDef(scope))
    );

    if (scope === undefined || !this.fetchEditableColumns) {
      return modelColumns;
    }

    return modelColumns.pipe(switchMap(columns => this.tableWidgetColumnsService.fetchColumn(scope, columns)));
  }

  public getChildModel(row: TableRow): object | undefined {
    if (this.mode === TableMode.Detail && this.childTemplate) {
      const childModel = this.api.createChild<object>(this.childTemplate, this);
      this.api.setVariable('row', row, childModel);

      return childModel;
    }

    return undefined;
  }
}
