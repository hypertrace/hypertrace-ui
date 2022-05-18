import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Color } from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-file-upload',
  styleUrls: ['./file-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="file-upload">
      <div
        class="upload-section"
        [ngClass]="{ 'drag-over': this.isDragOver }"
        htDropZone
        (dragOver)="this.onDragOver($event)"
        (dropped)="this.onDrop($event)"
      >
        <ht-icon
          class="cloud-upload-icon"
          icon="${IconType.CloudUpload}"
          size="${IconSize.ExtraLarger}"
          color="${Color.Blue4}"
        ></ht-icon>
        <input type="file" multiple="multiple" (change)="this.onFilesSelection($event)" hidden #fileInput />
        <div class="title">
          <div class="click-to-upload" (click)="fileInput.click()">Click to upload</div>
          or drag and drop
        </div>
        <div class="sub-text">{{ this.subText }}</div>
      </div>
      <div class="files-section">
        <div class="file" *ngFor="let file of this.files; let index = index">
          <ht-icon class="note-icon" icon="${IconType.Note}" size="${IconSize.Medium}" color="${Color.Blue4}"></ht-icon>
          <div class="file-info">
            <div class="basic-detail">
              <div class="file-name">{{ file.data.name }}</div>
              <div class="file-size">{{ file.data.size | htDisplayFileSize }}</div>
            </div>
            <div class="progress">
              <div class="progress-bar"><div class="bar" [style.width]="file.progress + '%'"></div></div>
              <div class="progress-percentage">{{ file.progress }}%</div>
            </div>
          </div>
          <ht-icon
            class="delete-icon"
            icon="${IconType.Trash}"
            size="${IconSize.Large}"
            color="${Color.Gray4}"
            (click)="this.deleteFile(index)"
          ></ht-icon>
        </div>
      </div>
    </div>
  `
})
export class FileUploadComponent {
  @Input()
  public subText: string = 'max size 2 GB';

  public isDragOver: boolean = false;
  public files: FileItem[] = [];

  private interval?: number;

  public constructor(private readonly cdr: ChangeDetectorRef) {}

  public onDragOver(isDragOver: boolean): void {
    this.isDragOver = isDragOver;
  }

  public onDrop(files: FileList): void {
    this.updateFileSelection(files);
  }

  public deleteFile(fileIndex: number): void {
    this.files.splice(fileIndex, 1);
  }

  public onFilesSelection(event: Event): void {
    this.updateFileSelection((event.target as HTMLInputElement)?.files ?? undefined);
  }

  private updateFileSelection(files?: FileList): void {
    this.files = !isNil(files) ? Array.from(files).map(fileData => ({ data: fileData, progress: 0 })) : [];
    // Random Logic, remove
    if (this.files.length > 0) {
      this.interval = setInterval(() => {
        if (this.files[0].progress >= 100) {
          clearInterval(this.interval);
        } else {
          console.log('here');
          this.files = this.files.map(file => ({ data: file.data, progress: file.progress + 10 }));
          this.cdr.detectChanges();
        }
      }, 1000);
    }
  }
}

export interface FileItem {
  data: File;
  progress: number; // Calculated in percentage
}
