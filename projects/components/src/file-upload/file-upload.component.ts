import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconType } from '@hypertrace/assets-library';
import { Color } from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { FileItem } from '../file-display/file-item';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-file-upload',
  styleUrls: ['./file-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: FileUploadComponent
    }
  ],
  template: `
    <div class="file-upload">
      <div
        class="upload-section"
        [ngClass]="{ 'drag-over': this.isDragOver, disabled: this.disabled }"
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
export class FileUploadComponent implements ControlValueAccessor {
  @Input()
  public subText: string = 'max size 2 GB';

  @Input()
  public disabled: boolean = false;

  @Output()
  private readonly fileUpload: EventEmitter<FileItem[]> = new EventEmitter();

  public readonly files: FileItem[] = [];
  public isDragOver: boolean = false;

  public constructor(private readonly cdr: ChangeDetectorRef) {}

  public writeValue(value?: FileItem[]): void {
    this.files.splice(0).push(...(value ?? []));
    this.fileUpload.emit(this.files);
    this.cdr.detectChanges();
  }

  public registerOnChange(onChange: (value?: FileItem[]) => void): void {
    this.propagateControlValueChange = onChange;
  }

  public registerOnTouched(onTouch: (value?: FileItem[]) => void): void {
    this.propagateControlValueChangeOnTouch = onTouch;
  }

  public setDisabledState(isDisabled?: boolean): void {
    this.disabled = isDisabled ?? false;
    this.cdr.detectChanges();
  }

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
    this.fileUpload.emit(this.files);
    this.propagateValueChangeToFormControl(this.files);
  }

  public onFilesSelection(event: Event): void {
    this.updateFileSelection((event.target as HTMLInputElement)?.files ?? undefined);
  }

  private propagateControlValueChange?: (value?: FileItem[]) => void;
  private propagateControlValueChangeOnTouch?: (value?: FileItem[]) => void;

  private propagateValueChangeToFormControl(value?: FileItem[]): void {
    this.propagateControlValueChange?.(value);
    this.propagateControlValueChangeOnTouch?.(value);
  }

  /**
   * Adds the new files at the last
   */
  private updateFileSelection(files?: FileList): void {
    this.files.push(...this.getFilesFromFileList(files));
    this.fileUpload.emit(this.files);
    this.propagateValueChangeToFormControl(this.files);
  }

  /**
   * Converts the FileList into FileItem[]
   */
  private getFilesFromFileList(files?: FileList): FileItem[] {
    return !isNil(files) ? Array.from(files).map(fileData => ({ data: fileData })) : [];
  }
}
