import { ActivatedRoute } from '@angular/router';
import { NavigationService, PreferenceService } from '@hypertrace/common';
import { LetAsyncModule, NavigationListComponent, NavigationListService } from '@hypertrace/components';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { BehaviorSubject, of } from 'rxjs';
import { NavigationComponent } from './navigation.component';

describe('NavigationComponent', () => {
  const createComponent = createComponentFactory({
    component: NavigationComponent,
    shallow: true,
    imports: [LetAsyncModule],
    declarations: [MockComponent(NavigationListComponent)],
    providers: [
      mockProvider(NavigationService, {
        getRouteConfig: () => ({
          data: {
            features: ['example-feature']
          }
        }),

      }),
      mockProvider(NavigationListService, { decorateNavItem: jest.fn().mockImplementation(navItem => ({ ...navItem, features: ['example-feature'] }))}),
      mockProvider(ActivatedRoute),
      mockProvider(PreferenceService, { get: jest.fn().mockReturnValue(of(false)) })
    ]
  });
  test('should decorate the config list', () => {
    const spectator = createComponent();
    expect(spectator.query(NavigationListComponent)?.navItems).toContainEqual(
      expect.objectContaining({ features: ['example-feature'] })
    );
  });

  test('should update preference when collapsedChange is emitted', () => {
    const spectator = createComponent({
      providers: [
        mockProvider(PreferenceService, {
          get: jest.fn().mockReturnValue(new BehaviorSubject(false))
        })
      ]
    });
    spectator.triggerEventHandler(NavigationListComponent, 'collapsedChange', true);
    expect(spectator.inject(PreferenceService).set).toHaveBeenCalledWith('app-navigation.collapsed', true);
  });
});
