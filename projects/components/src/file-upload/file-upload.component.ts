import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconType } from '@hypertrace/assets-library';
import { Color } from '@hypertrace/common';
import { isNil } from 'lodash-es';
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
        [ngClass]="{ 'drag-hover': this.isDragHover, disabled: this.disabled }"
        htDropZone
        (dragHover)="this.onDragHover($event)"
        (dropped)="this.onDrop($event)"
      >
        <ht-icon
          class="cloud-upload-icon"
          icon="${IconType.CloudUpload}"
          size="${IconSize.ExtraLarger}"
          color="${Color.Blue4}"
        ></ht-icon>
        <input
          type="file"
          multiple="multiple"
          (change)="this.onFilesSelection($event)"
          onclick="this.value = null"
          hidden
          #fileInput
        />
        <div class="title">
          <div class="click-to-upload" (click)="fileInput.click()">Click to upload</div>
          or drag and drop
        </div>
        <div class="sub-text">{{ this.subText }}</div>
      </div>

      <ng-content></ng-content>
    </div>
  `
})
export class FileUploadComponent implements ControlValueAccessor {
  @Input()
  public subText: string = '';

  @Input()
  public disabled: boolean = false;

  @Output()
  public readonly filesAdded: EventEmitter<File[]> = new EventEmitter();

  @Output()
  public readonly selectedFileChanges: EventEmitter<File[]> = new EventEmitter();

  public files: File[] = [];
  public isDragHover: boolean = false;

  public constructor(private readonly cdr: ChangeDetectorRef) {}

  public writeValue(value?: File[]): void {
    this.files.splice(0).push(...(value ?? []));
    this.selectedFileChanges.emit(this.files);
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

  public onDragHover(isDragHover: boolean): void {
    this.isDragHover = isDragHover;
  }

  public onDrop(list: FileList): void {
    const newFiles = this.getFilesFromFileList(list);

    this.updateFileSelection(newFiles);
  }

  /**
   * Removes the file from File[]
   */
  public deleteFile(fileIndex: number): void {
    this.files.splice(fileIndex, 1);
    this.selectedFileChanges.emit(this.files);
    this.propagateValueChangeToFormControl(this.files);
  }

  public onFilesSelection(event: Event): void {
    const list = (event.target as HTMLInputElement)?.files;
    this.updateFileSelection(this.getFilesFromFileList(list ?? undefined));
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
  private updateFileSelection(newFiles: File[]): void {
    this.files.push(...newFiles);
    this.filesAdded.emit(newFiles);
    this.selectedFileChanges.emit(this.files);
    this.propagateValueChangeToFormControl(this.files);
  }

  /**
   * Converts the FileList into File[]
   */
  private getFilesFromFileList(files?: FileList): File[] {
    return !isNil(files) ? Array.from(files) : [];
  }
}
