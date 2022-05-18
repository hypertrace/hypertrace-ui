import { createComponentFactory } from '@ngneat/spectator/jest';
import { FileUploadComponent } from './file-upload.component';

describe('File Upload Component', () => {
  const createComponent = createComponentFactory({
    component: FileUploadComponent,
    shallow: true
  });

  test('should render everything correctly', () => {
    const spectator = createComponent();
    expect(spectator.query('.file-upload')).toExist();
  });
});
