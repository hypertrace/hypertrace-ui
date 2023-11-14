import { RouterLinkWithHref } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  ExternalNavigationWindowHandling,
  NavigationParamsType,
  NavigationService,
  TrackDirective,
} from '@hypertrace/common';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { MockDirective } from 'ng-mocks';
import { of } from 'rxjs';
import { LetAsyncModule } from '../let-async/let-async.module';
import { LinkComponent } from './link.component';

describe('Link component', () => {
  let spectator: SpectatorHost<LinkComponent>;

  const createHost = createHostFactory({
    component: LinkComponent,
    imports: [LetAsyncModule, RouterTestingModule],
    providers: [mockProvider(NavigationService)],
    declarations: [MockDirective(RouterLinkWithHref), MockDirective(TrackDirective)],
  });

  test('Link contents should be displayed if params/url is undefined', () => {
    spectator = createHost(`<ht-link [paramsOrUrl]="paramsOrUrl"></ht-link>`, {
      props: {
        paramsOrUrl: undefined,
      },
    });

    const anchorElement = spectator.query('.ht-link');
    expect(anchorElement).toExist();
    expect(anchorElement).toHaveClass('ht-link internal disabled');
  });

  test('Link should navigate correctly to external URLs', () => {
    window.open = jest.fn();

    spectator = createHost(`<ht-link [paramsOrUrl]="paramsOrUrl"></ht-link>`, {
      hostProps: {
        paramsOrUrl: 'http://test.hypertrace.ai',
      },
      providers: [
        mockProvider(NavigationService, {
          buildNavigationParams$: jest.fn().mockReturnValue(
            of({
              path: [
                '/external',
                {
                  url: 'http://test.hypertrace.ai',
                  navType: 'same_window',
                },
              ],
              extras: { skipLocationChange: true },
            }),
          ),
          isExternalUrl: jest.fn().mockReturnValue(true),
        }),
      ],
    });

    let anchorElement = spectator.query('.ht-link.external') as HTMLAnchorElement;
    expect(anchorElement).toExist();
    expect(anchorElement).not.toHaveClass('disabled');
    expect(anchorElement.href).toBe('http://test.hypertrace.ai/');
    spectator.click(anchorElement);
    expect(window.open).toHaveBeenLastCalledWith('http://test.hypertrace.ai', '_self');

    // With new window
    spectator.setHostInput({
      paramsOrUrl: {
        navType: NavigationParamsType.External,
        url: '/test',
        windowHandling: ExternalNavigationWindowHandling.NewWindow,
      },
    });
    expect(anchorElement.href).toBe('http://localhost/test');
    spectator.click(anchorElement);
    expect(window.open).toHaveBeenLastCalledWith('/test', undefined);
  });

  test('Link should navigate correctly to internal relative URLs', () => {
    spectator = createHost(`<ht-link [paramsOrUrl]="paramsOrUrl"></ht-link>`, {
      hostProps: {
        paramsOrUrl: 'test',
      },
      providers: [
        mockProvider(NavigationService, {
          buildNavigationParams$: jest.fn().mockReturnValue(of({ path: ['test'], extras: {} })),
        }),
      ],
    });

    const anchorElement = spectator.query('.ht-link.internal');
    expect(anchorElement).toExist();
    expect(anchorElement).not.toHaveClass('disabled');
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
        paramsOrUrl: '/test',
      },
      providers: [
        mockProvider(NavigationService, {
          buildNavigationParams$: jest.fn().mockReturnValue(of({ path: ['/test'], extras: {} })),
        }),
      ],
    });

    const anchorElement = spectator.query('.ht-link.internal');
    expect(anchorElement).toExist();
    expect(anchorElement).not.toHaveClass('disabled');
    const routerLinkDirective = spectator.query(RouterLinkWithHref);

    expect(routerLinkDirective).toBeDefined();
    expect(routerLinkDirective?.routerLink).toEqual(['/test']);
    expect(routerLinkDirective?.skipLocationChange).toBeUndefined();
    expect(routerLinkDirective?.queryParams).toBeUndefined();
    expect(routerLinkDirective?.queryParamsHandling).toBeUndefined();
    expect(routerLinkDirective?.replaceUrl).toBeUndefined();
  });

  test('should apply disabled style when disabled', () => {
    spectator = createHost(`<ht-link [paramsOrUrl]="paramsOrUrl" [disabled]="true"></ht-link>`, {
      hostProps: {
        paramsOrUrl: '/test',
      },
      providers: [
        mockProvider(NavigationService, {
          buildNavigationParams$: jest.fn().mockReturnValue(of({ path: ['/test'], extras: {} })),
        }),
      ],
    });

    const anchorElement = spectator.query('.ht-link.internal');
    expect(anchorElement).toExist();
    expect(anchorElement).toHaveClass('ht-link internal disabled');

    const routerLinkDirective = spectator.query(RouterLinkWithHref);

    expect(routerLinkDirective).toBeDefined();
    expect(routerLinkDirective?.routerLink).toEqual(['/test']);
    expect(routerLinkDirective?.skipLocationChange).toBeUndefined();
    expect(routerLinkDirective?.queryParams).toBeUndefined();
    expect(routerLinkDirective?.queryParamsHandling).toBeUndefined();
    expect(routerLinkDirective?.replaceUrl).toBeUndefined();
  });
});
