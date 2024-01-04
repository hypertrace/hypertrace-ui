import { IconType } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { ButtonVariant } from '../button/button';
import { ButtonComponent } from '../button/button.component';
import { BackButtonComponent } from './back-button.component';

describe('Back Button Component', () => {
  let spectator: Spectator<BackButtonComponent>;

  const createHost = createHostFactory({
    component: BackButtonComponent,
    declarations: [MockComponent(ButtonComponent)],
    providers: [mockProvider(NavigationService)],
    shallow: true,
  });

  test('should render the button correctly', () => {
    spectator = createHost(`<ht-back-button></ht-back-button>`);

    const button = spectator.query(ButtonComponent);
    expect(button).toExist();
    expect(button?.variant).toBe(ButtonVariant.Primary);
    expect(button?.icon).toBe(IconType.ArrowLeft);
  });

  test('should navigate back on click event', () => {
    spectator = createHost(`<ht-back-button></ht-back-button>`);

    spectator.click('.back');
    expect(spectator.inject(NavigationService).navigateBack).toHaveBeenCalled();
  });
});
