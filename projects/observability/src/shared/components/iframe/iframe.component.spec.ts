import { createComponentFactory, Spectator } from '@ngneat/spectator';

import { IFrameComponent } from './iframe.component';

describe('IFrame  Component', () => {
  let spectator: Spectator<IFrameComponent>;

  const createComponent = createComponentFactory<IFrameComponent>({
    component: IFrameComponent,
    shallow: true
  });

  test('should render the iframe', () => {
    spectator = createComponent();
    expect(spectator.query('iframe')).toExist();
  });
});
