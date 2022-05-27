import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Color } from '@hypertrace/common';
import { IconSize } from '../icon/icon-size';
import { FileUploadStatus } from './file-display';

@Component({
  selector: 'ht-file-display',
  styleUrls: ['./file-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="this.file" class="file-display" [ngClass]="{ error: this.status === '${FileUploadStatus.Success}' }">
      <ht-icon class="note-icon" icon="${IconType.Note}" size="${IconSize.Medium}" color="${Color.Blue4}"></ht-icon>
      <div class="file-info">
        <div class="basic-detail">
          <div class="file-name">{{ this.file.name }}</div>
          <div class="file-size">{{ this.file.size | htDisplayFileSize }}</div>
        </div>
      </div>
      <ng-container [ngSwitch]="this.status"
        ><ng-container *ngSwitchCase="'${FileUploadStatus.Success}'"
          ><ht-icon class="success-icon" icon="${IconType.CheckCircle}" color="${Color.Green5}"></ht-icon></ng-container
        ><ng-container *ngSwitchCase="'${FileUploadStatus.Error}'"
          ><ht-icon
            class="success-icon"
            icon="${IconType.Alert}"
            color="${Color.Red6}"
            [htTooltip]="this.errorStatusTooltipText"
          ></ht-icon></ng-container
      ></ng-container>
      <ht-icon
        *ngIf="this.showDelete"
        class="delete-icon"
        icon="${IconType.CloseCircleFilled}"
        size="${IconSize.Small}"
        color="${Color.Gray9}"
        (click)="this.onDeleteClick()"
      ></ht-icon>
    </div>
  `
})
export class FileDisplayComponent {
  @Input()
  public file?: File;

  @Input()
  public showDelete: boolean = true;

  @Input()
  public status?: FileUploadStatus;

  @Input()
  public showStatus: boolean = false;

  @Input()
  public errorStatusTooltipText: string = '';

  @Output()
  public readonly deleteClick: EventEmitter<void> = new EventEmitter();

  public onDeleteClick(): void {
    this.deleteClick.emit();
  }
}
