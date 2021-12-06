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
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { LoggerService } from '@hypertrace/hyperdash-angular';
import { getMockFlexLayoutProviders } from '@hypertrace/test-utils';
import { mockProvider } from '@ngneat/spectator/jest';
import { EMPTY, of } from 'rxjs';
import { GraphQlQueryEventService } from '../shared/dashboard/data/graphql/graphql-query-event.service';
import { MetadataService } from '../shared/services/metadata/metadata.service';

export const mockDashboardProviders = [
  mockProvider(GraphQlRequestService),
  mockProvider(GraphQlQueryEventService),
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
    getFilterAttributes: () => of([]),
    getAttributeKeyDisplayName: (_: string, attributeKey: string) => of(attributeKey)
  }),
  mockProvider(LoggerService, {
    warn: jest.fn().mockImplementation(() => {
      throw new Error('Warn: Mocked Logger');
    }),
    info: jest.fn().mockImplementation(() => {
      throw new Error('Info: Mocked Logger');
    }),
    error: jest.fn().mockImplementation(() => {
      throw new Error('Error: Mocked Logger');
    })
  }),
  mockProvider(ActivatedRoute, {
    queryParamMap: EMPTY
  }),
  ...getMockFlexLayoutProviders()
];
