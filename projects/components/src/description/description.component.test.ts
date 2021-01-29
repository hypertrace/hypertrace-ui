import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { DescriptionComponent } from './description.component';

describe('Divider Component', () => {
  let spectator: Spectator<DescriptionComponent>;

  const createHost = createHostFactory<DescriptionComponent>({
    component: DescriptionComponent,
    shallow: true
  });

  test('should render the description', () => {
    spectator = createHost('<ht-description [description] = "description"> </ht-description>', {
      hostProps: {
        description: 'Description text'
      }
    });
    expect(spectator.query('.description')).toExist();
    expect(spectator.query('.description-text')).toHaveText('Description text');
  });

  test('should show full description text if pressed button show more', () => {
    spectator = createHost('<ht-description [description] = "description"> </ht-description>', {
      hostProps: {
        description: 'Description text'
      }
    });

    expect(spectator.component.isDescriptionTextToggled).toBeFalsy();
    spectator.component.toggleDescriptionText();
    expect(spectator.component.isDescriptionTextToggled).toBeTruthy();
  });
});
