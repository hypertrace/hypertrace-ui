import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { BetaTagComponent } from './beta-tag.component';

describe('Beta Tag Component', () => {
  let spectator: Spectator<BetaTagComponent>;

  const createHost = createHostFactory({
    component: BetaTagComponent,
    shallow: true
  });

  test('renders the beta tag', () => {
    spectator = createHost('<htc-beta-tag></htc-beta-tag>');
    expect(spectator.query('.beta-tag')).toHaveText('Beta');
  });
});
