import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import {
  FeatureState,
  FeatureStateResolver,
  LayoutChangeService,
  NavigationService,
  PreferenceService,
  SubscriptionLifecycle
} from '@hypertrace/common';
import { ButtonModule, NavItemType } from '@hypertrace/components';
import { byLabel, createRoutingFactory, mockProvider, SpectatorRouting } from '@ngneat/spectator/jest';
import { BehaviorSubject, EMPTY, of } from 'rxjs';
import { NavigationComponent } from './navigation.component';
import { NavigationModule } from './navigation.module';

describe('NavigationComponent', () => {
  let spectator: SpectatorRouting<NavigationComponent>;
  let spy: jest.SpyInstance;

  const createRoutingComponent = createRoutingFactory({
    declareComponent: false,
    component: NavigationComponent,
    imports: [NavigationModule, HttpClientTestingModule, IconLibraryTestingModule, ButtonModule],
    providers: [
      mockProvider(NavigationService, {
        navigation$: EMPTY,
        navigateWithinApp: jest.fn(),
        getCurrentActivatedRoute: jest.fn().mockReturnValue(
          of({
            root: {}
          })
        )
      }),
      mockProvider(ChangeDetectorRef),
      mockProvider(SubscriptionLifecycle),
      mockProvider(LayoutChangeService),
      mockProvider(FeatureStateResolver, {
        getCombinedFeatureState: () => of(FeatureState.Enabled)
      }),
      mockProvider(PreferenceService, { get: jest.fn().mockReturnValue(of(false)) })
    ]
  });

  beforeEach(() => {
    spectator = createRoutingComponent();

    spy = spectator.inject(NavigationService).navigateWithinApp;
  });

  test('should show a nav-item element for each NavItemConfig', () => {
    const linkNavItemCount = spectator.component.navItems.filter(value => value.type === NavItemType.Link).length;
    expect(spectator.queryAll('htc-nav-item').length).toBe(linkNavItemCount);
  });

  test('should navigate to NavItemConfig path when nav-item element clicked', () => {
    const element = spectator.query(byLabel('Explorer'));
    spectator.click(element!);
    expect(spy).toHaveBeenCalled();
  });

  test('should update preference when collapse nav-item element is clicked', () => {
    const collapsedSubject = new BehaviorSubject(false);

    spectator = createRoutingComponent({
      providers: [
        mockProvider(PreferenceService, {
          get: jest.fn().mockReturnValue(collapsedSubject)
        })
      ]
    });
    spectator.component.onViewToggle(true);
    expect(spectator.inject(PreferenceService).set).toHaveBeenCalledWith('app-navigation.collapsed', true);
  });
});
