import {
  CoreTableCellRendererType,
  FilterBuilderLookupService,
  TableCellAlignmentType,
  TableDataSource,
  TableMode,
  TableRow,
  TableSelectionMode,
  TableStyle
} from '@hypertrace/components';
import {
  ArrayPropertyTypeInstance,
  EnumPropertyTypeInstance,
  ENUM_TYPE,
  ModelTemplatePropertyType,
  WidgetHeaderModel
} from '@hypertrace/dashboards';
import {
  ARRAY_PROPERTY,
  BOOLEAN_PROPERTY,
  Model,
  ModelApi,
  ModelJson,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AttributeMetadata,
  AttributeMetadataType,
  toFilterAttributeType
} from '../../../graphql/model/metadata/attribute-metadata';
import { SpecificationBuilder } from '../../../graphql/request/builders/specification/specification-builder';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { InteractionHandler } from '../../interaction/interaction-handler';
import { TableWidgetRowSelectionModel } from './selections/table-widget-row-selection.model';
import { SpecificationBackedTableColumnDef, TableWidgetColumnModel } from './table-widget-column.model';
import { TableWidgetFilterModel } from './table-widget-filter-model';

@Model({
  type: 'table-widget',
  displayName: 'Table Widget'
})
export class TableWidgetModel {
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
    key: 'searchAttribute',
    displayName: 'Search Attribute',
    type: STRING_PROPERTY.type
  })
  public searchAttribute?: string;

  @ModelProperty({
    key: 'filterToggles',
    displayName: 'Filter Toggles',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ARRAY_PROPERTY.type,
      subtype: {
        key: ModelPropertyType.TYPE,
        defaultModelClass: TableWidgetFilterModel
      }
    } as ArrayPropertyTypeInstance
  })
  public filterToggles: TableWidgetFilterModel[] = [];

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
    key: 'modeToggles',
    displayName: 'Modes Toggle',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ARRAY_PROPERTY.type,
      subtype: {
        key: ENUM_TYPE.type,
        values: [TableMode.Flat, TableMode.Tree, TableMode.Detail]
      }
    } as ArrayPropertyTypeInstance
  })
  public modeToggles: TableMode[] = [];

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
    key: 'row-selection-handlers',
    displayName: 'Row selection Handlers',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ARRAY_PROPERTY.type,
      subtype: {
        key: ModelPropertyType.TYPE,
        defaultModelClass: TableWidgetRowSelectionModel
      }
    } as ArrayPropertyTypeInstance
  })
  public rowSelectionHandlers?: TableWidgetRowSelectionModel[];

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
    key: 'child-template',
    type: ModelTemplatePropertyType.TYPE
  })
  public childTemplate?: ModelJson;

  @ModelProperty({
    key: 'pageable',
    displayName: 'Pageable',
    type: BOOLEAN_PROPERTY.type
  })
  public pageable?: boolean = true;

  @ModelProperty({
    key: 'fetchEditableColumns',
    displayName: 'Query for additional columns not provided',
    type: BOOLEAN_PROPERTY.type
  })
  public fetchEditableColumns?: boolean = false;

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  @ModelInject(MetadataService)
  private readonly metadataService!: MetadataService;

  @ModelInject(FilterBuilderLookupService)
  private readonly filterBuilderLookupService!: FilterBuilderLookupService;

  public getData(): Observable<TableDataSource<TableRow>> {
    return this.api.getData<TableDataSource<TableRow>>();
  }

  public getColumns(scope?: string): Observable<SpecificationBackedTableColumnDef[]> {
    const modelColumns = this.columns.map(column => column.asTableColumnDef());

    if (scope === undefined || !this.fetchEditableColumns) {
      return of(modelColumns);
    }

    return this.metadataService.getSelectionAttributes(scope).pipe(
      map(attributes => [
        ...modelColumns,
        ...attributes
          .filter(attribute => this.filterNotModelColumnAttribute(attribute, modelColumns))
          .filter(attribute => this.filterEditableAttribute(attribute))
          .map(attribute => this.mapAttributeToColumnConfig(attribute))
      ])
    );
  }

  private filterNotModelColumnAttribute(
    attribute: AttributeMetadata,
    modelColumns: SpecificationBackedTableColumnDef[]
  ): boolean {
    return modelColumns.find(column => column.name === attribute.name) === undefined;
  }

  private filterEditableAttribute(attribute: AttributeMetadata): boolean {
    switch (attribute.type) {
      case AttributeMetadataType.Boolean:
      case AttributeMetadataType.Number:
      case AttributeMetadataType.String:
      case AttributeMetadataType.Timestamp:
        return false; // TODO: attribute vs metric
      default:
        return false;
    }
  }

  private mapAttributeToColumnConfig(attribute: AttributeMetadata): SpecificationBackedTableColumnDef {
    return {
      id: attribute.name,
      name: attribute.name,
      display: this.lookupDisplayType(attribute.type),
      title: attribute.displayName,
      titleTooltip: attribute.displayName,
      alignment: this.lookupAlignment(attribute.type),
      width: '1',
      visible: false,
      editable: true,
      filterable: this.isFilterable(attribute),
      specification: new SpecificationBuilder().attributeSpecificationForKey(attribute.name)
    };
  }

  private isFilterable(attribute: AttributeMetadata): boolean {
    return this.filterBuilderLookupService.isBuildableType(toFilterAttributeType(attribute.type));
  }

  private lookupDisplayType(type: AttributeMetadataType): string {
    switch (type) {
      case AttributeMetadataType.Number:
        return CoreTableCellRendererType.Number;
      case AttributeMetadataType.Timestamp:
        return CoreTableCellRendererType.Timestamp;
      default:
        return CoreTableCellRendererType.Text;
    }
  }

  private lookupAlignment(type: AttributeMetadataType): TableCellAlignmentType {
    switch (type) {
      case AttributeMetadataType.Number:
      case AttributeMetadataType.Timestamp:
        return TableCellAlignmentType.Right;
      default:
        return TableCellAlignmentType.Left;
    }
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
