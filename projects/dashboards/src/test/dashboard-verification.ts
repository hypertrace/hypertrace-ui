import { ActivatedRoute } from '@angular/router';
import {
  ColorService,
  LayoutChangeService,
  NavigationService,
  RelativeTimeRange,
  TimeDuration,
  TimeRangeService,
  TimeUnit
} from '@hypertrace/common';
import { MetadataService } from '@hypertrace/distributed-tracing';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { ModelJson } from '@hypertrace/hyperdash';
import { DashboardManagerService, LoggerService } from '@hypertrace/hyperdash-angular';
import { getMockFlexLayoutProviders } from '@hypertrace/test-utils';
import { mockProvider, Spectator } from '@ngneat/spectator/jest';
import { EMPTY, of } from 'rxjs';

export const isValidModelJson = (
  spectator: Spectator<unknown>,
  definition: ModelJson | { json: ModelJson }
): boolean => {
  const json = 'json' in definition ? definition.json : definition;
  try {
    spectator.inject(DashboardManagerService).create(json);

    return true;
  } catch {
    return false;
  }
};

export const mockDashboardProviders = [
  mockProvider(GraphQlRequestService),
  mockProvider(ColorService),
  mockProvider(LayoutChangeService, {
    layout$: of()
  }),
  mockProvider(TimeRangeService, {
    getTimeRangeAndChanges: () => EMPTY,
    getCurrentTimeRange: jest.fn().mockReturnValue(new RelativeTimeRange(new TimeDuration(15, TimeUnit.Minute)))
  }),
  mockProvider(NavigationService, {
    navigation$: EMPTY,
    getAllValuesForQueryParameter: () => []
  }),
  mockProvider(MetadataService, {
    getFilterAttributes: () => of([])
  }),
  mockProvider(LoggerService, {
    warn: jest.fn().mockImplementation(fail),
    info: jest.fn().mockImplementation(fail),
    error: jest.fn().mockImplementation(fail)
  }),
  mockProvider(ActivatedRoute, {
    queryParamMap: EMPTY
  }),
  ...getMockFlexLayoutProviders()
];
