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
import { ApiDetailService } from '../api-detail.service';
import { ApiMetricsComponent } from './api-metrics.component';
import { ApiMetricsModule } from './api-metrics.module';

describe('ApiMetricsComponent', () => {
  let spectator: Spectator<ApiMetricsComponent>;
  let spyLog: jest.SpyInstance;
  let spyDebug: jest.SpyInstance;
  let spyInfo: jest.SpyInstance;
  let spyWarn: jest.SpyInstance;
  let spyError: jest.SpyInstance;

  const createComponent = createComponentFactory({
    declareComponent: false,
    component: ApiMetricsComponent,
    imports: [ApiMetricsModule, HttpClientTestingModule, IconLibraryTestingModule],
    providers: [
      mockProvider(ColorService),
      mockProvider(ApiDetailService, {
        entityFilter$: of('')
      }),
      mockProvider(IntervalDurationService, {
        getAutoDuration: () => new TimeDuration(15, TimeUnit.Second)
      }),
      mockProvider(GraphQlRequestService),
      mockProvider(Router),
      mockProvider(NavigationService),
      mockProvider(EntitiesGraphqlQueryBuilderService),
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

  it('should configure filter correctly and not log any messages', () => {
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.component.filterConfig$).toBe('(x|)', {
        x: { scope: ObservabilityTraceType.Api, implicitFilters: [''], hideFilterBar: true }
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
