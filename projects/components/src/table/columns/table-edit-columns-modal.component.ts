import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ButtonVariant, ButtonStyle } from '../../button/button';
import { ModalRef, MODAL_DATA } from '../../modal/modal';
import { TableColumnConfigExtended } from '../table.service';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../../icon/icon-size';

@Component({
  selector: 'ht-edit-columns-modal',
  styleUrls: ['./table-edit-columns-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="edit-modal">
      <ht-button
        class="reset-button"
        label="Reset to default"
        variant="${ButtonVariant.Primary}"
        display="${ButtonStyle.PlainText}"
        (click)="this.onResetToDefault()"
      ></ht-button>
      <ht-search-box
        class="search-box"
        placeholder="Search"
        (valueChange)="this.onColumnItemSearch($event)"
      ></ht-search-box>

      <ht-draggable-list class="column-items" (draggableListChange)="this.columnsReorder($event)">
        <ht-draggable-item
          *ngFor="let column of this.getFilteredColumns | htMemoize: this.searchText; index as i"
          [data]="column"
        >
          <div class="column-item-container">
            <ht-icon
              class="vertical-grab-handle-icon"
              icon="${IconType.VerticalGrabHandle}"
              size="${IconSize.Medium}"
            ></ht-icon>
            <ht-checkbox
              class="checkbox"
              [label]="column.title"
              [htTooltip]="this.isLastRemainingColumn(column) ? this.disabledTooltip : column.titleTooltip"
              [checked]="column.visible"
              [disabled]="!column.editable || this.isLastRemainingColumn(column)"
              (checkedChange)="column.visible = !column.visible"
            ></ht-checkbox>
          </div>
        </ht-draggable-item>
      </ht-draggable-list>
      <div class="controls">
        <ht-button
          label="Cancel"
          class="cancel-button"
          variant="${ButtonVariant.Tertiary}"
          (click)="this.onCancel()"
        ></ht-button>
        <ht-button
          label="Apply"
          class="action-button"
          variant="${ButtonVariant.Additive}"
          (click)="this.onApply()"
        ></ht-button>
      </div>
    </div>
  `
})
export class TableEditColumnsModalComponent {
  public editColumns: TableColumnConfigExtended[];
  public searchText: string = '';

  public readonly disabledTooltip: string = 'At least one column must be enabled';

  public constructor(
    private readonly modalRef: ModalRef<TableColumnConfigExtended[]>,
    @Inject(MODAL_DATA) public readonly modalData: TableEditColumnsModalConfig
  ) {
    this.editColumns = this.filterMetadaDataColumnsAndOrderVisible(this.modalData.availableColumns);
  }

  public readonly getFilteredColumns = (searchText: string): TableColumnConfigExtended[] => {
    const lowercaseSearch = searchText.toLowerCase();
    return this.editColumns.filter(column => column.title?.toLowerCase()?.includes(lowercaseSearch));
  };

  public isLastRemainingColumn(column: TableColumnConfigExtended): boolean {
    const visibleCount: number = this.editColumns.filter(editColumn => editColumn.visible).length;

    return visibleCount === 1 && !!column.visible;
  }

  public onApply(): void {
    this.modalRef.close(this.editColumns); // $$state columns filtered out, but they are recreated by table
  }

  public onCancel(): void {
    this.modalRef.close();
  }

  public onResetToDefault(): void {
    this.editColumns = this.filterMetadaDataColumnsAndOrderVisible(this.modalData.defaultColumns);
  }

  public columnsReorder(editColumns: TableColumnConfigExtended[]): void {
    this.editColumns = editColumns;
  }

  public onColumnItemSearch(searchText: string): void {
    this.searchText = searchText;
  }

  private filterMetadaDataColumnsAndOrderVisible(columns: TableColumnConfigExtended[]): TableColumnConfigExtended[] {
    const unsortedColumns = columns
      .map(column => ({ ...column })) // Using this map to generate and handle a new array
      .filter(column => !this.isMetaTypeColumn(column));

    const visibleColumns = unsortedColumns.filter(a => a.visible);
    const otherColumnsSorted = unsortedColumns
      .filter(a => !a.visible)
      .sort((a, b) => (a.title?.toLocaleLowerCase() ?? '').localeCompare(b.title?.toLocaleLowerCase() ?? ''));

    return [...visibleColumns, ...otherColumnsSorted];
  }

  private isMetaTypeColumn(column: TableColumnConfigExtended): boolean {
    return column.id.startsWith('$$') || (column.attribute !== undefined && column.attribute.type.startsWith('$$'));
  }
}

export interface TableEditColumnsModalConfig {
  availableColumns: TableColumnConfigExtended[];
  defaultColumns: TableColumnConfigExtended[];
}
