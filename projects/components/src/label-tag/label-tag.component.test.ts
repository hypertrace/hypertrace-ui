import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { IconComponent } from '../icon/icon.component';
import { LabelTagComponent } from './label-tag.component';

describe('Label Tag Component', () => {
  let spectator: Spectator<LabelTagComponent>;

  const createHost = createHostFactory({
    component: LabelTagComponent,
    shallow: true,
    declarations: [MockComponent(IconComponent)]
  });

  test('renders the beta tag with given parameters', () => {
    spectator = createHost(
      '<ht-label-tag label="Beta" backgroundColor="#f2d0f5" labelColor="#94209f" prefixIcon="test-icon"></ht-label-tag>'
    );
    const labelElement = spectator.query('.label-tag') as HTMLElement;
    expect(labelElement).toHaveText('Beta');
    expect(labelElement.style.backgroundColor).toEqual('rgb(242, 208, 245)');
    expect(labelElement.style.color).toEqual('rgb(148, 32, 159)');
    expect(spectator.query(IconComponent)?.icon).toBe('test-icon');
  });
});
