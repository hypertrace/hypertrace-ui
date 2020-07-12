import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import {
  ColorService,
  IntervalDurationService,
  NavigationService,
  RelativeTimeRange,
  TimeDuration,
  TimeRangeService,
  TimeUnit
} from '@hypertrace/common';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { ObservabilityTraceType } from '../../../../shared/graphql/model/schema/observability-traces';
import { EntitiesGraphqlQueryBuilderService } from '../../../../shared/graphql/request/handlers/entities/query/entities-graphql-query-builder.service';
import { BackendDetailService } from '../backend-detail.service';
import { BackendMetricsComponent } from './backend-metrics.component';
import { BackendMetricsModule } from './backend-metrics.module';

describe('BackendMetricsComponent', () => {
  let spectator: Spectator<BackendMetricsComponent>;
  let spyLog: jest.SpyInstance;
  let spyDebug: jest.SpyInstance;
  let spyInfo: jest.SpyInstance;
  let spyWarn: jest.SpyInstance;
  let spyError: jest.SpyInstance;

  const createComponent = createComponentFactory({
    declareComponent: false,
    component: BackendMetricsComponent,
    imports: [BackendMetricsModule, HttpClientTestingModule, IconLibraryTestingModule],
    providers: [
      mockProvider(ColorService),
      mockProvider(BackendDetailService, {
        entityFilter$: of('')
      }),
      mockProvider(IntervalDurationService, {
        getAutoDuration: () => new TimeDuration(15, TimeUnit.Second)
      }),
      mockProvider(GraphQlRequestService),
      mockProvider(EntitiesGraphqlQueryBuilderService),
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

  test('should configure filter correctly and not log any messages', () => {
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.filterConfig$).toBe('(x|)', {
        x: { scope: ObservabilityTraceType.Backend, implicitFilters: [''], hideFilterBar: true }
      });
    });

    // If the ModelJson has an error in the 'type' string it logs a message
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyDebug).not.toHaveBeenCalled();
    expect(spyInfo).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
    expect(spyError).not.toHaveBeenCalled();
  });
});
