import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { DividerComponent } from './divider.component';

describe('Divider Component', () => {
  let spectator: Spectator<DividerComponent>;

  const createComponent = createComponentFactory<DividerComponent>({
    component: DividerComponent,
    shallow: true
  });

  test('should render the divider', () => {
    spectator = createComponent();
    expect(spectator.query('.divider')).toExist();
  });
});
