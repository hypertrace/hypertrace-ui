import { LinkComponent, IconComponent, IconSize } from '@hypertrace/components';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { ExploreFilterLinkComponent } from './explore-filter-link.component';
import { IconType } from '@hypertrace/assets-library';

describe('Explore Filter Link component', () => {
  let spectator: SpectatorHost<ExploreFilterLinkComponent>;

  const createHost = createHostFactory({
    component: ExploreFilterLinkComponent,
    declarations: [MockComponent(LinkComponent), MockComponent(IconComponent)]
  });

  test('should display all elements', () => {
    spectator = createHost(`<ht-link [paramsOrUrl]="paramsOrUrl"></ht-link>`, {
      props: {
        paramsOrUrl: undefined
      }
    });

    expect(spectator.query('.ht-link')).not.toExist();
  });

  test('Link should navigate correctly to external URLs', () => {
    spectator = createHost(`<ht-explore-filter-link [paramsOrUrl]="paramsOrUrl"></ht-explore-filter-link>`, {
      hostProps: {
        paramsOrUrl: 'http://test.hypertrace.ai'
      }
    });

    const linkComponent = spectator.query(LinkComponent);
    expect(linkComponent).toExist();
    expect(linkComponent?.paramsOrUrl).toEqual('http://test.hypertrace.ai');

    const iconComponent = spectator.query(IconComponent);
    expect(iconComponent).toExist();
    expect(iconComponent?.icon).toEqual(IconType.Filter);
    expect(iconComponent?.size).toEqual(IconSize.Small);
  });
});
