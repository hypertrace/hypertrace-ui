import { AbstractControl } from '@angular/forms';
import { sumBy } from 'lodash-es';
import { FileItem } from '../file-display/file-item';
import { UploadFileType } from './upload-file-type';

/**
 * @description
 * Provides a set of validators specifically for file upload component that can be used by form controls.
 */
export class FileUploadValidators {
  /**
   * @description
   * Validator that requires the control-value's file types to be present only in the provided types.
   *
   * @usageNotes
   *
   * ### Validate against [FileType.Json] as supported file types
   *
   * ```typescript
   * const files = [{
   *    data: new File([new Blob(['data'], {type: 'text'})], 'file.txt')
   * }]
   * const control = new FormControl(files, FileUploadValidators.supportedFileTypes([FileType.Json]));
   *
   * console.log(control.errors); // {supportedFileTypes: true}
   * ```
   *
   * @returns A validator function that returns an error map with the
   * `supportedFileTypes` property if the validation check fails, otherwise `null`.
   *
   *
   */
  public static supportedFileTypes = (fileTypes: UploadFileType[]) => (control: AbstractControl) =>
    getFileItemsFromControl(control)
      .map(file => file.data.type as UploadFileType)
      .some(type => !fileTypes.includes(type))
      ? { supportedFileTypes: true }
      : null;

  /**
   * @description
   * Validator that requires the max file size in control-value's files to be less than provided size.
   *
   * @usageNotes
   *
   * ### Validate against 3 as maximum size
   *
   * ```typescript
   * const files = [{
   *    data: new File([new Blob(['data'], {type: 'text'})], 'file.txt') // file size is 4
   * }]
   * const control = new FormControl(files, FileUploadValidators.maxFileSize(3));
   *
   * console.log(control.errors); // {maxFileSize: true}
   * ```
   *
   * @returns A validator function that returns an error map with the
   * `maxFileSize` property if the validation check fails, otherwise `null`.
   *
   *
   */
  public static maxFileSize = (maxSize: number) => (control: AbstractControl) =>
    getFileItemsFromControl(control)
      .map(file => file.data.size)
      .some(size => size > maxSize)
      ? { maxFileSize: true }
      : null;

  /**
   * @description
   * Validator that requires the max total size in control-value's files to be less than provided size.
   *
   * @usageNotes
   *
   * ### Validate against 9 as maximum total size
   *
   * ```typescript
   * const files = [
   *    {
   *        data: new File([new Blob(['data'], {type: 'text'})], 'file.txt') // file size is 4
   *    },
   *    {
   *        data: new File([new Blob(['data12'], {type: 'text'})], 'file.txt') // file size is 6
   *    }
   * ] // Total size is 10
   * const control = new FormControl(files, FileUploadValidators.maxTotalSize(9));
   *
   * console.log(control.errors); // {maxTotalSize: true}
   * ```
   *
   * @returns A validator function that returns an error map with the
   * `maxTotalSize` property if the validation check fails, otherwise `null`.
   *
   *
   */
  public static maxTotalSize = (maxTotalSize: number) => (control: AbstractControl) =>
    sumBy(getFileItemsFromControl(control), file => file.data.size) > maxTotalSize ? { maxTotalSize: true } : null;
}

// Converts the control value into the FileItem[]
const getFileItemsFromControl = (control: AbstractControl) => (control.value ?? []) as FileItem[];
