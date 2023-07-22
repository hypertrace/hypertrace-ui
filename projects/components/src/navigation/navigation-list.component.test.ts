import { ActivatedRoute } from '@angular/router';
import { IconType } from '@hypertrace/assets-library';
import {
  ExternalNavigationWindowHandling,
  FeatureState,
  FeatureStateResolver,
  MemoizeModule,
  NavigationParamsType,
  NavigationService
} from '@hypertrace/common';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { EMPTY, of } from 'rxjs';
import { IconComponent } from '../icon/icon.component';
import { LetAsyncModule } from '../let-async/let-async.module';
import { LinkComponent } from './../link/link.component';
import { NavItemComponent } from './nav-item/nav-item.component';
import { NavigationListComponentService } from './navigation-list-component.service';
import { NavigationListComponent } from './navigation-list.component';
import { FooterItemConfig, NavItemConfig, NavItemType } from './navigation.config';

describe('Navigation List Component', () => {
  let spectator: SpectatorHost<NavigationListComponent>;
  const activatedRoute = {
    root: {}
  };
  const createHost = createHostFactory({
    shallow: true,
    component: NavigationListComponent,
    declarations: [MockComponent(IconComponent), MockComponent(NavItemComponent), MockComponent(LinkComponent)],
    imports: [LetAsyncModule, MemoizeModule],
    providers: [
      mockProvider(ActivatedRoute, activatedRoute),
      mockProvider(NavigationListComponentService, {
        resolveFeaturesAndUpdateVisibilityForNavItems: jest
          .fn()
          .mockImplementation((navItems: NavItemConfig[]) =>
            navItems.map(item => (item.type !== NavItemType.Header ? item : { ...item, isVisible$: of(true) }))
          )
      }),
      mockProvider(NavigationService, {
        navigation$: EMPTY,
        navigateWithinApp: jest.fn(),
        getCurrentActivatedRoute: jest.fn().mockReturnValue(of(activatedRoute))
      }),
      mockProvider(FeatureStateResolver, {
        getCombinedFeatureState: jest.fn().mockReturnValue(of(FeatureState.Disabled))
      })
    ]
  });
  test('should show a nav-item element for each NavItemConfig', () => {
    const navItems: NavItemConfig[] = [
      {
        type: NavItemType.Link,
        icon: 'icon',
        label: 'label',
        matchPaths: ['']
      }
    ];
    spectator = createHost(`<ht-navigation-list></ht-navigation-list>`, { props: { navItems: navItems } });
    const linkNavItemCount = spectator.component.navItems.filter(value => value.type === NavItemType.Link).length;
    expect(spectator.queryAll(NavItemComponent).length).toBe(linkNavItemCount);
  });
  test('should show a footer-item element for each FooterItemConfig', () => {
    const navItems: NavItemConfig[] = [
      {
        type: NavItemType.Link,
        icon: 'icon',
        label: 'label',
        matchPaths: ['']
      }
    ];
    const footerItems: FooterItemConfig[] = [
      {
        url: 'http://test',
        label: 'Footer item',
        icon: 'icon'
      }
    ];
    spectator = createHost(
      `<ht-navigation-list [navItems]="navItems" [footerItems]="footerItems"></ht-navigation-list>`,
      {
        hostProps: { navItems: navItems, footerItems: footerItems }
      }
    );
    const footerItemsCount = spectator.component.footerItems?.length;
    expect(spectator.queryAll('.footer-item').length).toBe(footerItemsCount);
    expect(spectator.query(LinkComponent)?.paramsOrUrl).toMatchObject({
      navType: NavigationParamsType.External,
      url: 'http://test',
      windowHandling: ExternalNavigationWindowHandling.NewWindow
    });
  });

  test('should update layout when collapsed input is updated', () => {
    const navItems: NavItemConfig[] = [
      {
        type: NavItemType.Header,
        label: 'header 1',
        isVisible$: of(true)
      },
      {
        type: NavItemType.Link,
        icon: 'icon',
        label: 'label',
        matchPaths: ['']
      }
    ];
    spectator = createHost(`<ht-navigation-list [navItems]="navItems"></ht-navigation-list>`, {
      hostProps: { navItems: navItems }
    });
    expect(spectator.query('.navigation-list')).toHaveClass('expanded');
    expect(spectator.query(IconComponent)?.icon).toEqual(IconType.TriangleLeft);
    spectator.setInput({
      collapsed: true
    });
    spectator.detectChanges();
    expect(spectator.query('.navigation-list')).not.toHaveClass('expanded');
    expect(spectator.query(IconComponent)?.icon).toEqual(IconType.TriangleRight);
  });

  test('should only show one header 1', () => {
    const navItems: NavItemConfig[] = [
      {
        type: NavItemType.Header,
        label: 'header 1',
        isVisible$: of(true)
      },
      {
        type: NavItemType.Link,
        icon: 'icon',
        label: 'label-2',
        matchPaths: ['']
      },
      {
        type: NavItemType.Header,
        label: 'header 2',
        isVisible$: of(false)
      }
    ];

    spectator = createHost(`<ht-navigation-list [navItems]="navItems"></ht-navigation-list>`, {
      hostProps: { navItems: navItems },
      providers: [
        mockProvider(ActivatedRoute, activatedRoute),
        mockProvider(NavigationListComponentService, {
          resolveFeaturesAndUpdateVisibilityForNavItems: jest.fn().mockReturnValue(navItems)
        }),
        mockProvider(NavigationService, {
          navigation$: EMPTY,
          navigateWithinApp: jest.fn(),
          getCurrentActivatedRoute: jest.fn().mockReturnValue(of(activatedRoute))
        })
      ]
    });
    expect(spectator.queryAll('.nav-header')).toHaveLength(1);
    expect(spectator.queryAll('.nav-header .label')[0]).toHaveText('header 1');
  });

  test('should render nav group label and icon if provided', () => {
    const navItems: NavItemConfig[] = [
      {
        type: NavItemType.Header,
        label: 'header 1',
        isVisible$: of(true)
      },
      {
        type: NavItemType.Link,
        icon: 'icon',
        label: 'label',
        matchPaths: ['']
      }
    ];
    const footerItems: FooterItemConfig[] = [
      {
        url: 'http://test',
        label: 'Footer item',
        icon: 'icon'
      }
    ];
    const navGroup = {
      label: 'TEST LABEL',
      icon: IconType.StatusCode,
      displayNavList: true,
      navItems: navItems
    };
    spectator = createHost(
      `<ht-navigation-list [navGroup]="navGroup" [navItems]="navItems" [footerItems]="footerItems"></ht-navigation-list>`,
      {
        hostProps: { navItems: navItems, navGroup: navGroup, footerItems: footerItems },
        providers: [
          mockProvider(ActivatedRoute, activatedRoute),
          mockProvider(NavigationListComponentService, {
            resolveFeaturesAndUpdateVisibilityForNavItems: jest.fn().mockReturnValue(navItems)
          }),
          mockProvider(NavigationService, {
            navigation$: EMPTY,
            navigateWithinApp: jest.fn(),
            getCurrentActivatedRoute: jest.fn().mockReturnValue(of(activatedRoute))
          })
        ]
      }
    );
    expect(spectator.query('.nav-group-icon')).toExist();
    expect(spectator.query('.nav-group-label')).toExist();
  });
});
