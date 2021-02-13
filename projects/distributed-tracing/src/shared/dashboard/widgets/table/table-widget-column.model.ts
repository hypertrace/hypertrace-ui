import {
  CoreTableCellRendererType,
  TableCellAlignmentType,
  TableColumnConfig,
  TableRow,
  TableSortDirection
} from '@hypertrace/components';
import { EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import { BOOLEAN_PROPERTY, Model, ModelProperty, ModelPropertyType, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Specification } from '../../../graphql/model/schema/specifier/specification';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { InteractionHandler } from '../../interaction/interaction-handler';

@Model({
  type: 'table-widget-column',
  displayName: 'Column'
})
export class TableWidgetColumnModel {
  @ModelProperty({
    key: 'value',
    displayName: 'Value',
    required: true,
    type: ModelPropertyType.TYPE
  })
  public value!: Specification;

  @ModelProperty({
    key: 'title',
    displayName: 'Title',
    type: STRING_PROPERTY.type
  })
  public title?: string;

  @ModelProperty({
    key: 'titleTooltip',
    displayName: 'Title Tooltip',
    type: STRING_PROPERTY.type
  })
  public titleTooltip?: string;

  @ModelProperty({
    key: 'width',
    displayName: 'Width',
    type: STRING_PROPERTY.type
  })
  public width?: string;

  @ModelProperty({
    key: 'alignment',
    displayName: 'Alignment',
    type: STRING_PROPERTY.type
  })
  public alignment?: TableCellAlignmentType;

  @ModelProperty({
    key: 'visible',
    displayName: 'Visible',
    type: BOOLEAN_PROPERTY.type
  })
  public visible: boolean = true;

  @ModelProperty({
    key: 'filterable',
    displayName: 'Filterable',
    type: BOOLEAN_PROPERTY.type
  })
  public filterable?: boolean = false;

  @ModelProperty({
    key: 'display',
    displayName: 'Display',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: STRING_PROPERTY.type
  })
  public display: string = CoreTableCellRendererType.Text;

  @ModelProperty({
    key: 'click-handler',
    displayName: 'Click Handler',
    type: ModelPropertyType.TYPE
  })
  public clickHandler?: InteractionHandler;

  @ModelProperty({
    key: 'sort',
    displayName: 'Sort',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [TableSortDirection.Ascending, TableSortDirection.Descending]
    } as EnumPropertyTypeInstance
  })
  public sort?: TableSortDirection;

  @ModelProperty({
    key: 'sortable',
    type: BOOLEAN_PROPERTY.type
  })
  public sortable: boolean = true;

  @ModelInject(MetadataService)
  private readonly metadataService!: MetadataService;

  public asTableColumnDef(scope?: string): Observable<SpecificationBackedTableColumnDef> {
    return scope !== undefined
      ? this.metadataService
          .getAttributeKeyDisplayName(scope, this.value.name)
          .pipe(map(displayName => this.toSpecificationBackedColumnDef(displayName)))
      : of(this.toSpecificationBackedColumnDef());
  }

  private toSpecificationBackedColumnDef(displayName?: string): SpecificationBackedTableColumnDef {
    return {
      id: this.value.resultAlias(),
      name: this.value.name,
      display: this.display,
      title: this.title ?? displayName ?? this.value.name,
      titleTooltip: this.titleTooltip,
      alignment: this.alignment,
      width: this.width,
      visible: this.visible,
      editable: true,
      filterable: this.filterable,
      sort: this.sort,
      sortable: this.sortable,
      onClick: this.buildClickHandlerIfDefined(),
      specification: this.value
    };
  }

  private buildClickHandlerIfDefined(): ((row: TableRow) => void) | undefined {
    if (!this.clickHandler) {
      return undefined;
    }

    return row => this.clickHandler!.execute(row);
  }
}

export interface SpecificationBackedTableColumnDef extends TableColumnConfig {
  specification: Specification;
}
