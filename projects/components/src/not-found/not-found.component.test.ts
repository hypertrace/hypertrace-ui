import { NavigationService } from '@hypertrace/common';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { NotFoundComponent } from './not-found.component';

describe('Not found component', () => {
  const buildComponent = createComponentFactory({
    component: NotFoundComponent,
    shallow: true,
    providers: [mockProvider(NavigationService)]
  });
  test('can navigate home', () => {
    const spectator = buildComponent();
    spectator.click('.navigate-home-button');
    expect(spectator.inject(NavigationService).navigateToHome).toHaveBeenCalled();
  });
});
