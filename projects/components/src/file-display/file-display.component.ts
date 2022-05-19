import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Color } from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { IconSize } from '../icon/icon-size';
import { FileItem } from './file-item';

@Component({
  selector: 'ht-file-display',
  styleUrls: ['./file-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="this.file" class="file-display">
      <ht-icon class="note-icon" icon="${IconType.Note}" size="${IconSize.Medium}" color="${Color.Blue4}"></ht-icon>
      <div class="file-info">
        <div class="basic-detail">
          <div class="file-name">{{ this.file.data.name }}</div>
          <div class="file-size">{{ this.file.data.size | htDisplayFileSize }}</div>
        </div>
        <ht-progress-bar *ngIf="this.showProgressBar" [progress]="this.file.progress"></ht-progress-bar>
      </div>
      <ht-icon
        class="delete-icon"
        [ngClass]="{ disabled: this.isDeleteDisabled }"
        icon="${IconType.Trash}"
        size="${IconSize.Large}"
        [color]="!this.isDeleteDisabled ? '${Color.Gray4}' : '${Color.Gray2}'"
        (click)="this.onDeleteClick()"
      ></ht-icon>
    </div>
  `
})
export class FileDisplayComponent implements OnChanges {
  @Input()
  public file?: FileItem;

  @Output()
  private readonly deleteClick: EventEmitter<void> = new EventEmitter();

  public showProgressBar: boolean = true;
  public isDeleteDisabled: boolean = false;

  public ngOnChanges(): void {
    if (this.file) {
      this.showProgressBar = !isNil(this.file.progress);
      this.isDeleteDisabled = this.file?.inProgress ?? false;
    }
  }

  public onDeleteClick(): void {
    if (!this.isDeleteDisabled) {
      this.deleteClick.emit();
    }
  }
}
