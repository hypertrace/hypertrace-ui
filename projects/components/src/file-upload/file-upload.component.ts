import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconType } from '@hypertrace/assets-library';
import { Color } from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { FileUploadState } from '../file-display/file-display';
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
      <ht-progress-bar *ngIf="this.showProgress" class="bulk-progress-bar" [progress]="this.progress"></ht-progress-bar>
      <div class="files-section">
        <ht-file-display
          *ngFor="let file of this.files; let index = index"
          [file]="file"
          [showDelete]="this.uploadState === '${FileUploadState.NotStarted}'"
          (deleteClick)="this.deleteFile(index)"
        >
        </ht-file-display>
      </div>
    </div>
  `
})
export class FileUploadComponent implements ControlValueAccessor {
  @Input()
  public subText: string = '';

  @Input()
  public disabled: boolean = false;

  @Input()
  public showProgress: boolean = true; // To show bulk upload progress

  @Input()
  public progress: number = 0; // Bulk upload progress

  @Input()
  public uploadState: FileUploadState = FileUploadState.NotStarted;

  @Output()
  public readonly fileUpload: EventEmitter<File[]> = new EventEmitter();

  public files: File[] = [];
  public isDragOver: boolean = false;

  public constructor(private readonly cdr: ChangeDetectorRef) {}

  public writeValue(value?: File[]): void {
    this.files.splice(0).push(...(value ?? []));
    this.fileUpload.emit(this.files);
    this.cdr.detectChanges();
  }

  public registerOnChange(onChange: (value?: File[]) => void): void {
    this.propagateControlValueChange = onChange;
  }

  public registerOnTouched(onTouch: (value?: File[]) => void): void {
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
   * Removes the file from File[]
   */
  public deleteFile(fileIndex: number): void {
    this.files.splice(fileIndex, 1);
    this.fileUpload.emit(this.files);
    this.propagateValueChangeToFormControl(this.files);
  }

  public onFilesSelection(event: Event): void {
    this.updateFileSelection((event.target as HTMLInputElement)?.files ?? undefined);
  }

  private propagateControlValueChange?: (value?: File[]) => void;
  private propagateControlValueChangeOnTouch?: (value?: File[]) => void;

  private propagateValueChangeToFormControl(value?: File[]): void {
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
   * Converts the FileList into File[]
   */
  private getFilesFromFileList(files?: FileList): File[] {
    return !isNil(files) ? Array.from(files) : [];
  }
}
