import { NavigationService } from '@hypertrace/common';
import { mockProvider, Spectator } from '@ngneat/spectator';
import { createHostFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { IconComponent } from '../icon/icon.component';
import { LabelComponent } from '../label/label.component';
import { BackButtonComponent } from './back-button.component';

describe('Back Button Component', () => {
  let spectator: Spectator<BackButtonComponent>;

  const createHost = createHostFactory({
    component: BackButtonComponent,
    imports: [],
    declarations: [MockComponent(IconComponent), MockComponent(LabelComponent)],
    providers: [mockProvider(NavigationService)],
    shallow: true
  });

  test('should render the button correctly', () => {
    spectator = createHost(`<ht-back-button></ht-back-button>`);

    expect(spectator.query('.back')).toExist();
    expect(spectator.query(IconComponent)).toExist();
    expect(spectator.query(LabelComponent)).toExist();
  });

  test('should navigate back on click event', () => {
    spectator = createHost(`<ht-back-button></ht-back-button>`);

    spectator.click('.back');
    expect(spectator.inject(NavigationService).navigateBack).toHaveBeenCalled();
  });
});
