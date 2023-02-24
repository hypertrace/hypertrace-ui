import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { IconSize } from '../icon/icon-size';
import { IconComponent } from '../icon/icon.component';
import { InfoIconComponent } from './info-icon.component';

describe('Info Icon Component', () => {
  const createComponent = createComponentFactory({
    component: InfoIconComponent,
    declarations: [MockComponent(IconComponent)],
    shallow: true
  });

  test('should render everything correctly', () => {
    const spectator = createComponent();
    expect(spectator.query(IconComponent)).not.toExist();

    spectator.setInput({
      info: 'random info',
      iconSize: IconSize.Large
    });
    expect(spectator.query(IconComponent)).toExist();
    expect(spectator.query(IconComponent)?.size).toBe(IconSize.Large);
  });
});
