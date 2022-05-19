import { createComponentFactory } from '@ngneat/spectator/jest';
import { ProgressBarComponent } from './progress-bar.component';

describe('Progress Bar Component', () => {
  const createComponent = createComponentFactory({
    component: ProgressBarComponent,
    shallow: true
  });

  test('should render everything correctly', () => {
    const spectator = createComponent();
    expect(spectator.query('.progress-bar')).toExist();
  });
});
