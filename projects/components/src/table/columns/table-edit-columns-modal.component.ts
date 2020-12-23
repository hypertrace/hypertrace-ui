import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ButtonRole } from '../../button/button';
import { ModalRef, MODAL_DATA } from '../../modal/modal';
import { TableColumnConfigExtended } from '../table.service';

@Component({
  selector: 'ht-edit-columns-modal',
  styleUrls: ['./table-edit-columns-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="edit-modal">
      <div class="column-items">
        <ng-container *ngFor="let column of this.editColumns">
          <div class="column-item">
            <ht-checkbox
              [label]="column.title"
              [htTooltip]="this.isLastRemainingColumn(column) ? this.disabledTooltip : column.titleTooltip"
              [checked]="column.visible"
              [disabled]="!column.editable || this.isLastRemainingColumn(column)"
              (checkedChange)="column.visible = $event"
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
  public readonly editColumns: TableColumnConfigExtended[];
  public readonly disabledTooltip: string = 'At least one column must be enabled';

  public constructor(
    private readonly modalRef: ModalRef<TableColumnConfigExtended[]>,
    @Inject(MODAL_DATA) public readonly modalData: TableColumnConfigExtended[]
  ) {
    this.editColumns = this.modalData
      .filter(column => (column.attribute?.type as string) !== '$$state')
      .sort((a, b) => (a.visible === b.visible ? 0 : a.visible ? -1 : 1));
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
}
