import { RouterLinkWithHref } from '@angular/router';
import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { MockDirective } from 'ng-mocks';
import { LinkComponent } from './link.component';

describe('Link component', () => {
  let spectator: SpectatorHost<LinkComponent>;

  const createHost = createHostFactory({
    component: LinkComponent,
    providers: [mockProvider(NavigationService)],
    declarations: [MockDirective(RouterLinkWithHref)]
  });

  test('Link should not be displayed if url is undefined', () => {
    spectator = createHost(`<ht-link [paramsOrUrl]="paramsOrUrl"></ht-link>`, {
      props: {
        paramsOrUrl: undefined
      }
    });

    expect(spectator.query('.ht-link')).not.toExist();
  });

  test('Link should navigate correctly to external URLs', () => {
    spectator = createHost(`<ht-link [paramsOrUrl]="paramsOrUrl"></ht-link>`, {
      hostProps: {
        paramsOrUrl: 'http://test.hypertrace.ai'
      },
      providers: [
        mockProvider(NavigationService, {
          buildNavigationParams: jest.fn().mockReturnValue({
            path: [
              '/external',
              {
                url: 'http://test.hypertrace.ai',
                navType: 'same_window'
              }
            ],
            extras: { skipLocationChange: true }
          })
        })
      ]
    });

    expect(spectator.query('.ht-link')).toExist();
    const routerLinkDirective = spectator.query(RouterLinkWithHref);

    expect(routerLinkDirective).toBeDefined();
    expect(routerLinkDirective?.routerLink).toEqual([
      '/external',
      {
        url: 'http://test.hypertrace.ai',
        navType: 'same_window'
      }
    ]);
    expect(routerLinkDirective!.skipLocationChange).toBeTruthy();
    expect(routerLinkDirective!.queryParams).toBeUndefined();
    expect(routerLinkDirective!.queryParamsHandling).toBeUndefined();
    expect(routerLinkDirective!.replaceUrl).toBeUndefined();
  });

  test('Link should navigate correctly to internal relative URLs', () => {
    spectator = createHost(`<ht-link [paramsOrUrl]="paramsOrUrl"></ht-link>`, {
      hostProps: {
        paramsOrUrl: 'test'
      },
      providers: [
        mockProvider(NavigationService, {
          buildNavigationParams: jest.fn().mockReturnValue({ path: ['test'], extras: {} })
        })
      ]
    });

    expect(spectator.query('.ht-link')).toExist();
    const routerLinkDirective = spectator.query(RouterLinkWithHref);

    expect(routerLinkDirective).toBeDefined();
    expect(routerLinkDirective?.routerLink).toEqual(['test']);
    expect(routerLinkDirective?.skipLocationChange).toBeUndefined();
    expect(routerLinkDirective?.queryParams).toBeUndefined();
    expect(routerLinkDirective?.queryParamsHandling).toBeUndefined();
    expect(routerLinkDirective?.replaceUrl).toBeUndefined();
  });

  test('Link should navigate correctly to internal relative URLs', () => {
    spectator = createHost(`<ht-link [paramsOrUrl]="paramsOrUrl"></ht-link>`, {
      hostProps: {
        paramsOrUrl: '/test'
      },
      providers: [
        mockProvider(NavigationService, {
          buildNavigationParams: jest.fn().mockReturnValue({ path: ['/test'], extras: {} })
        })
      ]
    });

    expect(spectator.query('.ht-link')).toExist();
    const routerLinkDirective = spectator.query(RouterLinkWithHref);

    expect(routerLinkDirective).toBeDefined();
    expect(routerLinkDirective?.routerLink).toEqual(['/test']);
    expect(routerLinkDirective?.skipLocationChange).toBeUndefined();
    expect(routerLinkDirective?.queryParams).toBeUndefined();
    expect(routerLinkDirective?.queryParamsHandling).toBeUndefined();
    expect(routerLinkDirective?.replaceUrl).toBeUndefined();
  });
});
