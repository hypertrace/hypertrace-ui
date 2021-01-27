import { ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IconType } from '@hypertrace/assets-library';
import { NavigationParams, NavigationParamsType, NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { EMPTY, of } from 'rxjs';
import { IconComponent } from '../icon/icon.component';
import { LetAsyncModule } from '../let-async/let-async.module';
import { NavItemComponent } from './nav-item/nav-item.component';
import { FooterItemConfig, NavigationListComponent, NavItemConfig, NavItemType } from './navigation-list.component';
describe('Navigation List Component', () => {
  let spectator: SpectatorHost<NavigationListComponent>;
  const activatedRoute = {
    root: {}
  };
  const createHost = createHostFactory({
    shallow: true,
    component: NavigationListComponent,
    declarations: [MockComponent(IconComponent), MockComponent(NavItemComponent)],
    imports: [LetAsyncModule],
    providers: [
      mockProvider(ActivatedRoute, activatedRoute),
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

  test('should navigate to first match on click, relative to activated route', () => {
    const navItems: NavItemConfig[] = [
      {
        type: NavItemType.Link,
        icon: 'icon',
        label: 'Foo Label',
        matchPaths: ['foo', 'bar']
      }
    ];
    spectator = createHost(`<ht-navigation-list [navItems]="navItems"></ht-navigation-list>`, {
      hostProps: { navItems: navItems }
    });

    spectator.click(spectator.query(NavItemComponent, { read: ElementRef })!);
    expect(spectator.inject(NavigationService).navigate).toHaveBeenCalledWith<NavigationParams[]>({
      navType: NavigationParamsType.InApp,
      path: 'foo',
      relativeTo: spectator.inject(ActivatedRoute),
      replaceCurrentHistory: undefined
    });
  });

  test('should navigate to first match on click, relative to activated route with skip location change option', () => {
    const navItems: NavItemConfig[] = [
      {
        type: NavItemType.Link,
        icon: 'icon',
        label: 'Foo Label',
        matchPaths: ['foo', 'bar'],
        replaceCurrentHistory: true
      }
    ];
    spectator = createHost(`<ht-navigation-list [navItems]="navItems"></ht-navigation-list>`, {
      hostProps: { navItems: navItems }
    });

    spectator.click(spectator.query(NavItemComponent, { read: ElementRef })!);
    expect(spectator.inject(NavigationService).navigate).toHaveBeenCalledWith<NavigationParams[]>({
      navType: NavigationParamsType.InApp,
      path: 'foo',
      relativeTo: spectator.inject(ActivatedRoute),
      replaceCurrentHistory: true
    });
  });
});
