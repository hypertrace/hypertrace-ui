import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { LabelTagComponent } from './label-tag.component';

describe('Label Tag Component', () => {
  let spectator: Spectator<LabelTagComponent>;

  const createHost = createHostFactory({
    component: LabelTagComponent,
    shallow: true
  });

  test('renders the beta tag with given parameters', () => {
    spectator = createHost('<ht-label-tag label="Beta" backgroundColor="#f2d0f5" labelColor="#94209f"></ht-label-tag>');
    const labelElement = spectator.query<HTMLElement>('.label-tag');
    expect(labelElement).toHaveText('Beta');
    expect(labelElement?.style.backgroundColor).toEqual('rgb(242, 208, 245)');
    expect(labelElement?.style.color).toEqual('rgb(148, 32, 159)');
  });
});
