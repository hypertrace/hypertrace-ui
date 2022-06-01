import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { createHostFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { FileDisplayComponent } from './file-display/file-display.component';
import { IconComponent } from '../icon/icon.component';
import {
  maxFileCountValidator,
  maxFileSizeValidator,
  maxTotalSizeValidator,
  supportedFileTypesValidator,
  UploadFileType
} from './file-upload-validators';
import { FileUploadComponent } from './file-upload.component';
import { FileUploadModule } from './file-upload.module';

describe('File Upload Component', () => {
  const createHost = createHostFactory({
    component: FileUploadComponent,
    shallow: true,
    imports: [FileUploadModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
    declarations: [MockComponent(FileDisplayComponent), MockComponent(IconComponent)]
  });

  test('should render everything correctly', () => {
    const file: File = new File([new Blob(['test'])], 'test-file.txt');
    const fileList: FileList = { 0: file, length: 1, item: (_index: number) => file };
    const formControl = new FormControl([]);

    const spectator = createHost(`<ht-file-upload [formControl]="formControl"></ht-file-upload>`, {
      hostProps: {
        formControl: formControl
      }
    });
    expect(spectator.query('.file-upload')).toExist();
    expect(spectator.queryAll(FileDisplayComponent).length).toBe(0);

    // Testing click to upload
    spectator.triggerEventHandler('input', 'change', { target: { files: fileList } });
    expect(spectator.queryAll(FileDisplayComponent).length).toBe(1);
    expect(formControl.value).toMatchObject([file]);

    // Testing drag hover
    spectator.triggerEventHandler('.upload-section', 'dragHover', true);
    expect(spectator.query('.upload-section.drag-hover')).toExist();

    // Testing drop
    spectator.triggerEventHandler('.upload-section', 'dropped', fileList);
    spectator.triggerEventHandler('.upload-section', 'dragHover', false);
    expect(formControl.value).toMatchObject([file, file]);

    // Testing delete
    spectator.triggerEventHandler(FileDisplayComponent, 'deleteClick', undefined);
    expect(formControl.value).toMatchObject([file]);

    // Testing disabled
    formControl.disable();
    expect(spectator.query('.upload-section.disabled')).toExist();

    // Testing Validation errors
    const formControlWithValidators = new FormControl(
      [file, file],
      [
        supportedFileTypesValidator([UploadFileType.Json]),
        maxFileSizeValidator(3),
        maxTotalSizeValidator(7),
        maxFileCountValidator(1)
      ]
    );
    spectator.setHostInput({ formControl: formControlWithValidators });
    expect(formControlWithValidators.hasError('supportedFileTypes')).toBe(true);
    expect(formControlWithValidators.hasError('maxFileSize')).toBe(true);
    expect(formControlWithValidators.hasError('maxTotalSize')).toBe(true);
    expect(formControlWithValidators.hasError('maxFileCount')).toBe(true);
  });
});
