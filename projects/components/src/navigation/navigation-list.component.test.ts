import { ActivatedRoute } from '@angular/router';
import { IconType } from '@hypertrace/assets-library';
import { FooterItemConfig, MemoizeModule, NavigationService, NavItemConfig, NavItemType } from '@hypertrace/common';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { EMPTY, of } from 'rxjs';
import { IconComponent } from '../icon/icon.component';
import { LetAsyncModule } from '../let-async/let-async.module';
import { LinkComponent } from './../link/link.component';
import { NavItemComponent } from './nav-item/nav-item.component';
import { NavigationListComponentService } from './navigation-list-component.service';
import { NavigationListComponent } from './navigation-list.component';
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
  });

  test('should update layout when collapsed input is updated', () => {
    spectator = createHost(`<ht-navigation-list></ht-navigation-list>`);
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
});
