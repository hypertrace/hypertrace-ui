import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { TypedSimpleChanges } from '@hypertrace/common';
import { ModalSize } from '../../modal/modal';
import { ModalService } from '../../modal/modal.service';
import { TableEditColumnsModalComponent } from '../columns/table-edit-columns-modal.component';
import { TableColumnConfigExtended } from '../table.service';

@Component({
  selector: 'ht-table-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-menu-dropdown class="actions-menu" icon="${IconType.MoreVertical}">
      <ht-menu-item class="action-item" label="Edit Columns" (click)="this.onEditColumns()"></ht-menu-item>
    </ht-menu-dropdown>
  `
})
export class TableSettingsComponent implements OnChanges {
  @Input()
  public availableColumns?: TableColumnConfigExtended[] = [];

  @Output()
  public readonly columnsChange: EventEmitter<TableColumnConfigExtended[]> = new EventEmitter();

  public isDisabled: boolean = true;

  public classes: string[] = [];

  @ViewChild('htmlTooltip')
  public htmlTooltipTemplate?: TemplateRef<unknown>;
  public sanitizedHtmlForTooltip?: string;

  public constructor(private readonly modalService: ModalService) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.availableColumns) {
      this.isDisabled = !this.availableColumns?.some(column => column.editable === true) ?? true;
    }
  }

  public onEditColumns(): void {
    this.modalService
      .createModal<TableColumnConfigExtended[], TableColumnConfigExtended[]>({
        content: TableEditColumnsModalComponent,
        size: ModalSize.Medium,
        showControls: true,
        title: 'Edit Columns',
        data: this.availableColumns ?? []
      })
      .closed$.subscribe(columnConfigs => {
        this.columnsChange.emit(columnConfigs);
      });
  }
}
