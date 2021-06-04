import { ActivatedRoute } from '@angular/router';
import { IconType } from '@hypertrace/assets-library';
import {
  FeatureState,
  FeatureStateResolver,
  MemoizeModule,
  NavigationParamsType,
  NavigationService
} from '@hypertrace/common';
import { BetaTagComponent, IconComponent, LinkComponent } from '@hypertrace/components';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { EMPTY, of } from 'rxjs';
import { NavItemConfig, NavItemType } from '../navigation-list.component';
import { FeatureConfigCheckModule } from './../../feature-check/feature-config-check.module';
import { NavItemComponent } from './nav-item.component';

describe('Navigation Item Component', () => {
  let spectator: SpectatorHost<NavItemComponent>;
  const activatedRoute = {
    root: {}
  };
  const createHost = createHostFactory({
    shallow: true,
    component: NavItemComponent,
    declarations: [MockComponent(IconComponent), MockComponent(LinkComponent), MockComponent(BetaTagComponent)],
    imports: [MemoizeModule, FeatureConfigCheckModule],
    providers: [
      mockProvider(ActivatedRoute, activatedRoute),
      mockProvider(NavigationService, {
        navigation$: EMPTY,
        navigateWithinApp: jest.fn(),
        getCurrentActivatedRoute: jest.fn().mockReturnValue(of(activatedRoute))
      }),
      mockProvider(FeatureStateResolver, {
        getCombinedFeatureState: () => of(FeatureState.Enabled)
      })
    ]
  });

  test('should update layout when collapsed input is updated', () => {
    const navItem: NavItemConfig = {
      type: NavItemType.Link,
      icon: IconType.TriangleLeft,
      label: 'Foo Label',
      matchPaths: ['foo', 'bar']
    };
    spectator = createHost(`<ht-nav-item [config]="navItem"></ht-nav-item>`, {
      hostProps: { navItem: navItem }
    });

    expect(spectator.query('.label')).not.toExist();
    expect(spectator.query(IconComponent)?.icon).toEqual(IconType.TriangleLeft);

    spectator.setInput({
      collapsed: false
    });

    spectator.detectChanges();
    expect(spectator.query('.label')).toExist();
    expect(spectator.query(IconComponent)?.icon).toEqual(IconType.TriangleLeft);
  });

  test('should navigate to first match on click, relative to activated route', () => {
    const navItem: NavItemConfig = {
      type: NavItemType.Link,
      icon: 'icon',
      label: 'Foo Label',
      matchPaths: ['foo', 'bar']
    };
    spectator = createHost(`<ht-nav-item [config]="navItem"></ht-nav-item>`, {
      hostProps: { navItem: navItem }
    });

    const link = spectator.query(LinkComponent);
    expect(link).toExist();
    expect(link?.paramsOrUrl).toEqual({
      navType: NavigationParamsType.InApp,
      path: 'foo',
      relativeTo: spectator.inject(ActivatedRoute),
      replaceCurrentHistory: undefined
    });
  });

  test('should navigate to first match on click, relative to activated route with skip location change option', () => {
    const navItem: NavItemConfig = {
      type: NavItemType.Link,
      icon: 'icon',
      label: 'Foo Label',
      matchPaths: ['foo', 'bar'],
      replaceCurrentHistory: true
    };

    spectator = createHost(`<ht-nav-item [config]="navItem"></ht-nav-item>`, {
      hostProps: { navItem: navItem }
    });

    const link = spectator.query(LinkComponent);
    expect(link).toExist();
    expect(link?.paramsOrUrl).toEqual({
      navType: NavigationParamsType.InApp,
      path: 'foo',
      relativeTo: spectator.inject(ActivatedRoute),
      replaceCurrentHistory: true
    });
  });
});
