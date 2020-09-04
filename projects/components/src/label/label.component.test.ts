import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { LabelComponent } from './label.component';
import { LabelModule } from './label.module';

describe('Label component', () => {
  let spectator: Spectator<LabelComponent>;

  const createHost = createHostFactory({
    declareComponent: false,
    component: LabelComponent,
    imports: [LabelModule],
    providers: [mockProvider(NavigationService)]
  });

  test('should show label in DOM when provided', () => {
    spectator = createHost(`<htc-label [label]="label"></htc-label>`, {
      hostProps: {
        label: 'test'
      }
    });
    expect(spectator.element).toHaveText('test');
    expect(spectator.query('.no-label')).not.toExist();
  });

  test('should keep label in DOM and apply "no-label" class when empty string', () => {
    spectator = createHost(`<htc-label [label]="label"></htc-label>`, {
      hostProps: {
        label: ''
      }
    });
    spectator.component.label = '';
    expect(spectator.element).toHaveText('no-label');
    expect(spectator.query('.no-label')).toExist();
  });

  test('should keep label in DOM and apply "no-label" class when empty undefined', () => {
    spectator = createHost(`<htc-label></htc-label>`);
    expect(spectator.element).toHaveText('no-label');
    expect(spectator.query('.no-label')).toExist();
  });
});
