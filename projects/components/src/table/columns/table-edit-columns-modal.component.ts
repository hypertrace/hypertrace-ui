import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ButtonRole, ButtonStyle } from '../../button/button';
import { ModalRef, MODAL_DATA } from '../../modal/modal';
import { TableColumnConfigExtended } from '../table.service';

@Component({
  selector: 'ht-edit-columns-modal',
  styleUrls: ['./table-edit-columns-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="edit-modal">
      <ht-button
        class="reset-button"
        label="Reset to default"
        role="${ButtonRole.Primary}"
        display="${ButtonStyle.PlainText}"
        (click)="this.onResetToDefault()"
      ></ht-button>
      <div class="column-items">
        <ng-container *ngFor="let column of this.editColumns; index as i">
          <div class="column-item">
            <ht-checkbox
              [label]="column.title"
              [htTooltip]="this.isLastRemainingColumn(column) ? this.disabledTooltip : column.titleTooltip"
              [checked]="column.visible"
              [disabled]="!column.editable || this.isLastRemainingColumn(column)"
              (checkedChange)="this.selectColumn($event, i)"
            ></ht-checkbox>
          </div>
        </ng-container>
      </div>

      <div class="controls">
        <ht-button
          label="Cancel"
          class="cancel-button"
          role="${ButtonRole.Tertiary}"
          (click)="this.onCancel()"
        ></ht-button>
        <ht-button
          label="Apply"
          class="action-button"
          role="${ButtonRole.Additive}"
          (click)="this.onApply()"
        ></ht-button>
      </div>
    </div>
  `
})
export class TableEditColumnsModalComponent {
  public editColumns: TableColumnConfigExtended[];
  public readonly disabledTooltip: string = 'At least one column must be enabled';

  public constructor(
    private readonly modalRef: ModalRef<TableColumnConfigExtended[]>,
    @Inject(MODAL_DATA) public readonly modalData: TableEditColumnsModalConfig
  ) {
    this.editColumns = this.filterMetadaDataColumnsAndOrderVisible(this.modalData.availableColumns);
  }

  public selectColumn(checked: boolean, index: number): void {
    this.editColumns[index] = {
      ...this.editColumns[index],
      visible: checked
    };
  }

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

  private filterMetadaDataColumnsAndOrderVisible(columns: TableColumnConfigExtended[]): TableColumnConfigExtended[] {
    return columns
      .filter(column => !this.isMetaTypeColumn(column))
      .sort((a, b) => (a.visible === b.visible ? 0 : a.visible ? -1 : 1));
  }

  private isMetaTypeColumn(column: TableColumnConfigExtended): boolean {
    return column.id.startsWith('$$') || (column.attribute !== undefined && column.attribute.type.startsWith('$$'));
  }
}

export interface TableEditColumnsModalConfig {
  availableColumns: TableColumnConfigExtended[];
  defaultColumns: TableColumnConfigExtended[];
}
