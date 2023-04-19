import { AbstractControl } from '@angular/forms';
import { sumBy } from 'lodash-es';

/**
 * @description
 * Current set of upload file types
 *
 * @usageNotes
 * This is used to provide supported file types as array into `FileUploadValidators.supportedFileTypes(<>)`
 *
 */
export const enum UploadFileType {
  Json = 'application/json',
  Yaml = 'application/x-yaml'
}

/**
 * @description
 * Provides a set of validators specifically for file upload component that can be used by form controls.
 */

/**
 * @description
 * Validator that requires the control-value's file types to be present only in the provided types.
 *
 * @usageNotes
 *
 * ### Validate against [FileType.Json] as supported file types
 *
 * ```typescript
 * const files = [new File([new Blob(['data'], {type: 'text'})], 'file.txt')]
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
export const supportedFileTypesValidator = (fileTypes: UploadFileType[]) => (control: AbstractControl) =>
  getFilesFromControl(control)
    .map(file => file.type as UploadFileType)
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
 * const files = [new File([new Blob(['data'], {type: 'text'})], 'file.txt')] // file size is 4
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
export const maxFileSizeValidator = (maxSize: number) => (control: AbstractControl) =>
  getFilesFromControl(control)
    .map(file => file.size)
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
 *  new File([new Blob(['data'], {type: 'text'})], 'file.txt'), // file size is 4
 *  new File([new Blob(['data12'], {type: 'text'})], 'file.txt') // file size is 6
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
export const maxTotalSizeValidator = (maxTotalSize: number) => (control: AbstractControl) =>
  sumBy(getFilesFromControl(control), file => file.size) > maxTotalSize ? { maxTotalSize: true } : null;

/**
 * @description
 * Validator that requires the max file count in control-value's files to be less than provided count.
 *
 * @usageNotes
 *
 * ### Validate against 1 as maximum file count
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
 * const control = new FormControl(files, FileUploadValidators.maxFileCount(1));
 *
 * console.log(control.errors); // {maxFileCount: true}
 * ```
 *
 * @returns A validator function that returns an error map with the
 * `maxFileCount` property if the validation check fails, otherwise `null`.
 *
 *
 */
export const maxFileCountValidator = (maxFileCount: number) => (control: AbstractControl) =>
  getFilesFromControl(control).length > maxFileCount ? { maxFileCount: true } : null;

// Converts the control value into the File[]
const getFilesFromControl = (control: AbstractControl) => (control.value ?? []) as File[];
