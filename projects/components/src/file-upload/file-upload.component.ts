import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Color, DisplayFileSizePipe } from '@hypertrace/common';
import { isEmpty, isNil } from 'lodash-es';
import { IconSize } from '../icon/icon-size';
import { NotificationService } from '../notification/notification.service';
import { FileTypeUtil, SupportedFileType } from './file-types';

@Component({
  selector: 'ht-file-upload',
  styleUrls: ['./file-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
          [attr.multiple]="this.config.maxNumberOfFiles > 1 ? '' : null"
          [attr.accept]="this.getAcceptedFileTypes | htMemoize: this.config.supportedFileTypes"
          (change)="this.onFilesSelection($event)"
          onclick="this.value = null"
          hidden
          #fileInput
        />
        <div class="title">
          <div class="click-to-upload" (click)="fileInput.click()">Click to upload</div>
          or drag and drop
        </div>
        <div class="sub-text" *ngIf="this.subText; else defaultSubTpl">{{ this.subText }}</div>
      </div>

      <ng-content></ng-content>
    </div>

    <ng-template #defaultSubTpl>
      <ul class="file-requirements-list">
        <li class="item">
          <ht-icon class="icon" icon="${IconType.CheckCircleFill}" size="${IconSize.ExtraSmall}"></ht-icon>
          <div class="text"><strong>File Types</strong>: {{ this.config.supportedFileTypes | htFilePipe }}</div>
        </li>
        <li class="item">
          <ht-icon class="icon" icon="${IconType.CheckCircleFill}" size="${IconSize.ExtraSmall}"></ht-icon>
          <div class="text">
            <strong>Max File Size</strong>: {{ this.config.maxFileSizeInBytes | htDisplayFileSize }}
          </div>
        </li>
        <li class="item">
          <ht-icon class="icon" icon="${IconType.CheckCircleFill}" size="${IconSize.ExtraSmall}"></ht-icon>
          <div class="text"><strong>Max Files</strong>: {{ this.config.maxNumberOfFiles | htDisplayNumber }}</div>
        </li>
      </ul>
    </ng-template>
  `
})
export class FileUploadComponent {
  @Input()
  public subText?: string;

  @Input()
  public disabled: boolean = false;

  @Input()
  public config: UploaderConfig = {
    maxNumberOfFiles: 10,
    maxFileSizeInBytes: 20 * 1024 * 1024, // 20 MB
    supportedFileTypes: Object.values(SupportedFileType)
  };

  @Output()
  public readonly filesAdded: EventEmitter<File[]> = new EventEmitter();

  public files: File[] = [];
  public isDragHover: boolean = false;
  private readonly fileDisplayPipe: DisplayFileSizePipe = new DisplayFileSizePipe();

  public constructor(private readonly notificationService: NotificationService) {}

  public onDragHover(isDragHover: boolean): void {
    this.isDragHover = isDragHover;
  }

  public onDrop(list: FileList): void {
    if (this.validateFilesAndShowToastOnError(list)) {
      const newFiles = this.getFilesFromFileList(list);
      this.updateFileSelection(newFiles);
    }
  }

  public onFilesSelection(event: Event): void {
    const list = (event.target as HTMLInputElement)?.files;
    if (this.validateFilesAndShowToastOnError(list)) {
      this.updateFileSelection(this.getFilesFromFileList(list ?? undefined));
    }
  }

  public getAcceptedFileTypes(supportedFileTypes: SupportedFileType[]): string {
    return FileTypeUtil.supportedFileExtensions(supportedFileTypes).join(',');
  }

  /**
   * Adds the new files at the last
   */
  private updateFileSelection(newFiles: File[]): void {
    this.files.push(...newFiles);
    this.filesAdded.emit(newFiles);
  }

  /**
   * Converts the FileList into File[]
   */
  private getFilesFromFileList(files?: FileList | null): File[] {
    return !isNil(files) ? Array.from(files) : [];
  }

  public validateFilesAndShowToastOnError(fileList: FileList | null): boolean {
    if (!this.isFileCountValid(fileList)) {
      this.showFileCountErrorToast();

      return false;
    }

    if (!this.areFileSizesValid(fileList)) {
      this.showFileSizeErrorToast();

      return false;
    }

    if (!this.areFileTypesValid(fileList)) {
      this.showFileTypeErrorToast();

      return false;
    }

    if (this.areFilesEmpty(fileList)) {
      this.showEmptyFilesErrorToast();

      return false;
    }

    return true;
  }

  private isFileCountValid(fileList: FileList | null): boolean {
    return !isEmpty(fileList) && fileList!.length <= this.config.maxNumberOfFiles;
  }

  private areFileSizesValid(fileList: FileList | null): boolean {
    return this.getFilesFromFileList(fileList).every(file => file.size <= this.config.maxFileSizeInBytes);
  }

  private areFileTypesValid(fileList: FileList | null): boolean {
    return this.getFilesFromFileList(fileList).every(file =>
      FileTypeUtil.supportedFileMimeTypesSet(this.config.supportedFileTypes).has(file.type)
    );
  }
  private areFilesEmpty(fileList: FileList | null): boolean {
    return this.getFilesFromFileList(fileList).some(file => file.size === 0);
  }

  private showFileSizeErrorToast(): void {
    this.notificationService.createFailureToast(
      `File size should not be more than ${this.fileDisplayPipe.transform(this.config.maxFileSizeInBytes)}`
    );
  }

  private showEmptyFilesErrorToast(): void {
    this.notificationService.createFailureToast(`File should not be empty`);
  }

  private showFileTypeErrorToast(): void {
    this.notificationService.createFailureToast(
      `File type should be any of ${this.config.supportedFileTypes.join(', ')}`
    );
  }

  private showFileCountErrorToast(): void {
    this.notificationService.createFailureToast(`File count should not be more than ${this.config.maxNumberOfFiles}`);
  }
}

export interface UploaderConfig {
  supportedFileTypes: SupportedFileType[];
  maxFileSizeInBytes: number;
  maxNumberOfFiles: number;
}
