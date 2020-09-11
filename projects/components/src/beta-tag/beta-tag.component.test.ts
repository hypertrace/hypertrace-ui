import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { LabelTagComponent } from '../label-tag/label-tag.component';
import { BetaTagComponent } from './beta-tag.component';

describe('Beta Tag Component', () => {
  let spectator: Spectator<BetaTagComponent>;

  const createHost = createHostFactory({
    component: BetaTagComponent,
    declarations: [LabelTagComponent],
    shallow: true
  });

  test('renders the beta tag with given parameters', () => {
    spectator = createHost('<ht-beta-tag></ht-beta-tag>');
    const labelElement = spectator.query('.label-tag') as HTMLElement;
    expect(labelElement).toHaveText('Beta');
    expect(labelElement.style.backgroundColor).toEqual('rgb(242, 208, 245)');
    expect(labelElement.style.color).toEqual('rgb(148, 32, 159)');
  });
});
