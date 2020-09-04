import { fakeAsync } from '@angular/core/testing';
import { NavigationService } from '@hypertrace/common';
import {
  createComponentFactory,
  createHostFactory,
  mockProvider,
  Spectator,
  SpectatorHost
} from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { LinkComponent } from './link.component';

describe('Link component', () => {
  let spectator: Spectator<LinkComponent>;
  let hostSpectator: SpectatorHost<LinkComponent>;

  const createComponent = createComponentFactory({
    component: LinkComponent,
    providers: [
      mockProvider(NavigationService, {
        navigateWithinApp: jest.fn().mockReturnValue(EMPTY)
      })
    ],
    shallow: true
  });
  const createHost = createHostFactory(LinkComponent);

  test('Link should not be displayed if url is undefined', fakeAsync(() => {
    spectator = createComponent();

    expect(spectator.query('.ht-link-anchor')).not.toExist();
  }));

  test('Link should navigate correctly to external URLs', fakeAsync(() => {
    const props = { url: 'http://test.hypertrace.ai' };
    hostSpectator = createHost(`<ht-link>Test</ht-link>`, {
      props: props
    });
    hostSpectator.inject(NavigationService).isExternalUrl.mockReturnValue(true);

    expect(hostSpectator.query('.ht-link')).toExist();
    hostSpectator.triggerEventHandler('.ht-link', 'click', {});
    expect(hostSpectator.inject(NavigationService).navigateExternal).toHaveBeenCalledWith(props.url);
    expect(hostSpectator.inject(NavigationService).navigateWithinApp).not.toHaveBeenCalled();
  }));

  test('Link should navigate correctly to internal relative URLs', fakeAsync(() => {
    const props = { url: 'test' };
    hostSpectator = createHost(`<ht-link>Test</ht-link>`, {
      props: props
    });

    expect(hostSpectator.query('.ht-link')).toExist();
    hostSpectator.triggerEventHandler('.ht-link', 'click', {});
    expect(hostSpectator.inject(NavigationService).navigateWithinApp).toHaveBeenCalledWith(props.url);
  }));

  test('Link should navigate correctly to internal absolute URLs', fakeAsync(() => {
    const props = { url: '/test' };
    hostSpectator = createHost(`<ht-link>Test</ht-link>`, {
      props: props
    });

    expect(hostSpectator.query('.ht-link')).toExist();
    hostSpectator.triggerEventHandler('.ht-link', 'click', {});
    expect(hostSpectator.inject(NavigationService).navigateWithinApp).toHaveBeenCalledWith(props.url);
  }));

  test('Clicking on link should do nothing when URL is empty', fakeAsync(() => {
    const props = { url: '' };
    hostSpectator = createHost(`<ht-link>Test</ht-link>`, {
      props: props
    });

    expect(hostSpectator.query('.ht-link')).not.toExist();
  }));
});
