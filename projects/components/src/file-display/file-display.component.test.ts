import { createComponentFactory } from '@ngneat/spectator/jest';
import { FileDisplayComponent } from './file-display.component';

describe('File Display Component', () => {
  const createComponent = createComponentFactory({
    component: FileDisplayComponent,
    shallow: true
  });

  test('should render everything correctly', () => {
    const spectator = createComponent();
    expect(spectator.query('.file-display')).toExist();
  });
});
