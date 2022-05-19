import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Color } from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { FileItem } from '../file-display/file-item';
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
        <ht-file-display
          *ngFor="let file of this.files; let index = index"
          [file]="file"
          (deleteClick)="this.deleteFile(index)"
        >
        </ht-file-display>
      </div>
    </div>
  `
})
export class FileUploadComponent {
  @Input()
  public subText: string = 'max size 2 GB';

  public isDragOver: boolean = false;
  public readonly files: FileItem[] = [];

  public onDragOver(isDragOver: boolean): void {
    this.isDragOver = isDragOver;
  }

  public onDrop(files: FileList): void {
    this.updateFileSelection(files);
  }

  /**
   * Removes the file from FileItem[]
   */
  public deleteFile(fileIndex: number): void {
    this.files.splice(fileIndex, 1);
  }

  public onFilesSelection(event: Event): void {
    this.updateFileSelection((event.target as HTMLInputElement)?.files ?? undefined);
  }

  /**
   * Adds the new files at the last
   */
  private updateFileSelection(files?: FileList): void {
    this.files.push(...this.getFilesFromFileList(files));
  }

  /**
   * Converts the FileList into FileItem[]
   */
  private getFilesFromFileList(files?: FileList): FileItem[] {
    return !isNil(files) ? Array.from(files).map(fileData => ({ data: fileData })) : [];
  }
}
