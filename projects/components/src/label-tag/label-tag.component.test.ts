import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { LabelTagComponent } from './label-tag.component';

describe('Label Tag Component', () => {
  let spectator: Spectator<LabelTagComponent>;

  const createHost = createHostFactory({
    component: LabelTagComponent,
    shallow: true
  });

  test('renders the beta tag', () => {
    spectator = createHost('<ht-label-tag label="Beta" backgroundColor="#f2d0f5" labelColor="#94209f"></ht-label-tag>');
    expect(spectator.query('.label-tag')).toHaveText('Beta');
    expect(spectator.query('.label-tag')).toHaveStyle({ backgroundColor: '#f2d0f5', color: '#94209f' });
  });
});
