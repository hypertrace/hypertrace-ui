import { Color } from '@hypertrace/common';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { ProgressBarComponent } from './progress-bar.component';

describe('Progress Bar Component', () => {
  const createComponent = createComponentFactory({
    component: ProgressBarComponent,
    shallow: true
  });

  test('should render everything correctly', () => {
    const spectator = createComponent({
      props: {
        progress: 40
      }
    });
    expect(spectator.query('.progress')).toExist();
    expect(spectator.query('.progress-bar')).toHaveStyle({ backgroundColor: Color.Gray3 });
    expect(spectator.query('.progress-bar .bar')).toHaveStyle({ backgroundColor: Color.Blue4, width: '40%' });
    expect(spectator.query('.progress-percentage')).toHaveText('40%');
  });
});
