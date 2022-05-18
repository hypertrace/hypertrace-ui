import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Color } from '@hypertrace/common';
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
        <input type="file" (change)="this.onFilesSelection($event)" hidden #fileInput />
        <div class="title">
          <div class="click-to-upload" (click)="fileInput.click()">Click to upload</div>
          or drag and drop
        </div>
        <div class="sub-text">{{ this.subText }}</div>
      </div>
      <div class="files-section"></div>
    </div>
  `
})
export class FileUploadComponent {
  @Input()
  public subText: string = 'max size 2 GB';

  public isDragOver: boolean = false;

  public onDragOver(isDragOver: boolean): void {
    this.isDragOver = isDragOver;
  }

  public onDrop(files: FileList): void {
    console.log(files);
  }

  public onFilesSelection(event: Event): void {
    console.log((event.target as HTMLInputElement).files);
  }
}
