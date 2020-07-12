import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import {
  ColorService,
  NavigationService,
  RelativeTimeRange,
  TimeDuration,
  TimeRangeService,
  TimeUnit
} from '@hypertrace/common';
import { ApplicationAwareDashboardComponent } from '@hypertrace/distributed-tracing';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { ENTITY_METADATA } from '@hypertrace/observability';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { HomeComponent } from './home.component';
import { HomeModule } from './home.module';

describe('Home Dashboard', () => {
  let spectator: Spectator<HomeComponent>;
  let spyLog: jest.SpyInstance;
  let spyDebug: jest.SpyInstance;
  let spyInfo: jest.SpyInstance;
  let spyWarn: jest.SpyInstance;
  let spyError: jest.SpyInstance;

  const createComponent = createComponentFactory({
    declareComponent: false,
    component: HomeComponent,
    imports: [HomeModule, HttpClientTestingModule, IconLibraryTestingModule],
    providers: [
      {
        provide: ENTITY_METADATA,
        useValue: new Map()
      },
      mockProvider(ColorService),
      mockProvider(GraphQlRequestService),
      mockProvider(Router),
      mockProvider(NavigationService),
      mockProvider(TimeRangeService, {
        getTimeRangeAndChanges: jest.fn().mockReturnValue(of(new RelativeTimeRange(new TimeDuration(1, TimeUnit.Hour))))
      })
    ]
  });

  beforeEach(() => {
    spyLog = jest.spyOn(global.console, 'log');
    spyDebug = jest.spyOn(global.console, 'debug');
    spyInfo = jest.spyOn(global.console, 'info');
    spyWarn = jest.spyOn(global.console, 'warn');
    spyError = jest.spyOn(global.console, 'error');

    spectator = createComponent();
  });

  test('should receive dashboard ready callback and not log any messages', () => {
    expect(spectator.query(ApplicationAwareDashboardComponent)!.dashboard).toBeDefined();

    // If the ModelJson has an error in the 'type' string it logs a message
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyDebug).not.toHaveBeenCalled();
    expect(spyInfo).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
    expect(spyError).not.toHaveBeenCalled();
  });
});
