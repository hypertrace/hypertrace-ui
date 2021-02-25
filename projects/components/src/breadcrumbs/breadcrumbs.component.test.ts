import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { byText, createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { BreadcrumbsComponent } from './breadcrumbs.component';
import { BreadcrumbsModule } from './breadcrumbs.module';

fdescribe('BreadcrumbsComponent', () => {
  let spectator: Spectator<BreadcrumbsComponent>;
  let spy: jest.SpyInstance;

  const createHost = createHostFactory({
    declareComponent: false,
    component: BreadcrumbsComponent,
    imports: [BreadcrumbsModule, HttpClientTestingModule, IconLibraryTestingModule],
    providers: [
      mockProvider(NavigationService, {
        navigation$: EMPTY,
        navigateWithinApp: jest.fn()
      })
    ]
  });

  beforeEach(() => {
    spectator = createHost(`<ht-breadcrumbs [breadcrumbs]="breadcrumbs"></ht-breadcrumbs>`, {
      hostProps: {
        breadcrumbs: [
          {
            label: 'First',
            type: 'First Type',
            icon: 'firstIcon',
            url: ['first', 'second'],
            alwaysShowIcon: false
          },
          {
            label: 'Second',
            icon: 'secondIcon',
            alwaysShowIcon: true
          },
          {
            label: 'Third',
            type: 'Third Type',
            icon: 'thirdIcon',
            url: ['first', 'second', 'third'],
            alwaysShowIcon: false
          }
        ]
      }
    });

    spy = spectator.inject(NavigationService).navigateWithinApp;
    spy.mockReset();
  });

  it('should show three breadcrumbs when instantiated', () => {
    expect(spectator.queryAll('.breadcrumbs .breadcrumb').length).toBe(3);
  });

  it('should show icon on the first crumb', () => {
    const crumbs = spectator.queryAll('.breadcrumbs .breadcrumb');
    expect(crumbs[0].querySelector('ht-icon')).toExist();
  });

  it('should display the icon if alwaysShowIcon is true', () => {
    const crumbs = spectator.queryAll('.breadcrumbs .breadcrumb');
    crumbs.shift();
    crumbs.forEach((crumb, index) => {
      if (index === 0) {
        expect(crumb.querySelector('ht-icon')).toExist();
      } else {
        expect(crumb.querySelector('ht-icon')).toBeNull();
      }
    });
  });

  it('should make last crumb inactive', () => {
    expect(spectator.queryAll('.inactive-crumb').length).toBe(1);
    expect(spectator.queryAll('.inactive-crumb')[0]).toHaveText('Third');
  });

  it('should navigate when url is provided in breadcrumb', () => {
    const element = spectator.query(byText('First'));
    spectator.click(element!);
    expect(spy).toHaveBeenCalled();
  });

  it('should not navigate when url is not provided in breadcrumb', () => {
    const element = spectator.query(byText('Second'));
    spectator.click(element!);
    expect(spy).not.toHaveBeenCalled();
  });
});
