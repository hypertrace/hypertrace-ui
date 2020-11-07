import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FilterBuilderLookupService } from '../../../../../../../components/src/filtering/filter/builder/filter-builder-lookup.service';
import { CoreTableCellRendererType } from '../../../../../../../components/src/table/cells/types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../../../../../../components/src/table/cells/types/table-cell-alignment-type';
import {
  AttributeMetadata,
  AttributeMetadataType,
  toFilterAttributeType
} from '../../../../graphql/model/metadata/attribute-metadata';
import { SpecificationBuilder } from '../../../../graphql/request/builders/specification/specification-builder';
import { MetadataService } from '../../../../services/metadata/metadata.service';
import { SpecificationBackedTableColumnDef } from '../table-widget-column.model';

@Injectable({ providedIn: 'root' })
export class TableWidgetColumnsService {
  public constructor(
    private readonly metadataService: MetadataService,
    private readonly filterBuilderLookupService: FilterBuilderLookupService
  ) {}

  public fetchColumn(
    scope: string,
    existingColumns: SpecificationBackedTableColumnDef[]
  ): Observable<SpecificationBackedTableColumnDef[]> {
    return this.metadataService.getSelectionAttributes(scope).pipe(
      map(attributes => [
        ...existingColumns,
        ...attributes
          .filter(attribute => !this.isExplicitlyDeclaredAttribute(attribute, existingColumns))
          .filter(attribute => !this.isAggregationOnlyAttribute(attribute))
          .flatMap(attribute => this.mapAttributeToColumnConfig(attribute))
      ])
    );
  }

  private isExplicitlyDeclaredAttribute(
    attribute: AttributeMetadata,
    existingColumns: SpecificationBackedTableColumnDef[]
  ): boolean {
    return existingColumns.find(column => column.name === attribute.name) !== undefined;
  }

  private isAggregationOnlyAttribute(attribute: AttributeMetadata): boolean {
    return attribute.onlySupportsAggregation;
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
}
