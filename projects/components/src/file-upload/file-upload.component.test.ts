import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationService, SupportedFileType, UploaderConfig } from '@hypertrace/components';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { IconComponent } from '../icon/icon.component';
import { FileUploadComponent } from './file-upload.component';
import { FileUploadModule } from './file-upload.module';

describe('File Upload Component', () => {
  const createHost = createHostFactory({
    component: FileUploadComponent,
    shallow: true,
    imports: [FileUploadModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
    declarations: [MockComponent(IconComponent)],
    providers: [
      mockProvider(NotificationService, {
        createFailureToast: jest.fn(),
      }),
    ],
  });

  test('should render everything correctly', () => {
    const file: File = new File([new Blob(['test'])], 'test-file.json', {
      type: 'application/json',
    });
    const fileList: FileList = { 0: file, length: 1, item: (_index: number) => file };
    const spectator = createHost(`<ht-file-upload></ht-file-upload>`);
    const filesAddedSpy = jest.spyOn(spectator.component.filesAdded, 'emit');
    expect(spectator.query('.file-upload')).toExist();

    // Testing click to upload
    spectator.triggerEventHandler('input', 'change', { target: { files: fileList } });
    expect(filesAddedSpy).toHaveBeenLastCalledWith([file]);
  });

  test('should work correctly with drag and drop', () => {
    const file: File = new File([new Blob(['test'])], 'test-file.json', {
      type: 'application/json',
    });
    const fileList: FileList = { 0: file, length: 1, item: (_index: number) => file };
    const spectator = createHost(`<ht-file-upload></ht-file-upload>`);
    const filesAddedSpy = jest.spyOn(spectator.component.filesAdded, 'emit');
    // Testing drag hover
    spectator.triggerEventHandler('.upload-section', 'dragHover', true);
    expect(spectator.query('.upload-section.drag-hover')).toExist();

    // Testing drop
    spectator.triggerEventHandler('.upload-section', 'dropped', fileList);
    spectator.triggerEventHandler('.upload-section', 'dragHover', false);
    expect(filesAddedSpy).toHaveBeenLastCalledWith([file]);
  });

  test('should show error when number of files exceeds limit', () => {
    const config: UploaderConfig = {
      maxNumberOfFiles: 1,
      maxFileSizeInBytes: 1000,
      supportedFileTypes: Object.values(SupportedFileType),
    };
    const file: File = new File([new Blob(['test'])], 'test-file.json', {
      type: 'application/json',
    });
    const fileList: FileList = { 0: file, 1: file, length: 2, item: (_index: number) => file };
    const spectator = createHost(`<ht-file-upload [config]="config"></ht-file-upload>`, {
      hostProps: {
        config: config,
      },
    });
    const filesAddedSpy = jest.spyOn(spectator.component.filesAdded, 'emit');
    spectator.triggerEventHandler('input', 'change', { target: { files: fileList } });
    expect(filesAddedSpy).not.toHaveBeenCalled();
    expect(spectator.inject(NotificationService).createFailureToast).toHaveBeenCalledWith(
      `File count should not be more than ${config.maxNumberOfFiles}`,
    );
  });

  test('should show error when file type selected is not supported', () => {
    const config: UploaderConfig = {
      maxNumberOfFiles: 1,
      maxFileSizeInBytes: 1000,
      supportedFileTypes: [SupportedFileType.Json],
    };
    const file: File = new File([new Blob(['test'])], 'test-file.yaml', {
      type: 'application/x-yaml',
    });
    const fileList: FileList = { 0: file, length: 1, item: (_index: number) => file };
    const spectator = createHost(`<ht-file-upload [config]="config"></ht-file-upload>`, {
      hostProps: {
        config: config,
      },
    });
    const filesAddedSpy = jest.spyOn(spectator.component.filesAdded, 'emit');
    spectator.triggerEventHandler('input', 'change', { target: { files: fileList } });
    expect(filesAddedSpy).toHaveBeenCalled();
    expect(spectator.inject(NotificationService).createInfoToast).toHaveBeenCalledWith(
      `Make sure to choose file of type ${config.supportedFileTypes.join(', ')}`,
    );
  });

  test('should show error when size exceeds max', () => {
    const config: UploaderConfig = {
      maxNumberOfFiles: 1,
      maxFileSizeInBytes: 1024,
      supportedFileTypes: [SupportedFileType.Json],
    };
    const file: File = new File([new Blob(['test'])], 'test-file.json', {
      type: 'application/json',
    });
    Object.defineProperty(file, 'size', { value: 1025 });
    const fileList: FileList = { 0: file, length: 1, item: (_index: number) => file };
    const spectator = createHost(`<ht-file-upload [config]="config"></ht-file-upload>`, {
      hostProps: {
        config: config,
      },
    });
    const filesAddedSpy = jest.spyOn(spectator.component.filesAdded, 'emit');
    spectator.triggerEventHandler('input', 'change', { target: { files: fileList } });
    expect(filesAddedSpy).not.toHaveBeenCalled();
    expect(spectator.inject(NotificationService).createFailureToast).toHaveBeenCalledWith(
      `File size should not be more than 1 KB`,
    );
  });

  test('should show error when there is an empty file', () => {
    const config: UploaderConfig = {
      maxNumberOfFiles: 1,
      maxFileSizeInBytes: 1024,
      supportedFileTypes: [SupportedFileType.Json],
    };
    const file: File = new File([new Blob([''])], 'test-file.json', {
      type: 'application/json',
    });
    Object.defineProperty(file, 'size', { value: 0 });
    const fileList: FileList = { 0: file, length: 1, item: (_index: number) => file };
    const spectator = createHost(`<ht-file-upload [config]="config"></ht-file-upload>`, {
      hostProps: {
        config: config,
      },
    });
    const filesAddedSpy = jest.spyOn(spectator.component.filesAdded, 'emit');
    spectator.triggerEventHandler('input', 'change', { target: { files: fileList } });
    expect(filesAddedSpy).not.toHaveBeenCalled();
    expect(spectator.inject(NotificationService).createFailureToast).toHaveBeenCalledWith(`File should not be empty`);
  });
});
