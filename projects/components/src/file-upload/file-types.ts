import { AbstractControl, ValidatorFn } from '@angular/forms';
import { isNil } from 'lodash-es';

// Add file types for file upload
export const enum FileType {
  Json = 'application/json',
  Yaml = 'application/x-yaml'
}

/**
 * It validates the supported file types
 */
// tslint:disable:no-null-keyword
export const supportedFileTypes = (fileTypes?: FileType[]): ValidatorFn => {
  return (control: AbstractControl) => {
    return isNil(fileTypes)
      ? null
      : ((control.value ?? []) as File[]).map(file => file.type as FileType).every(type => fileTypes.includes(type)) // Change this
      ? { emptyStringSegments: true }
      : null;
  };
};
