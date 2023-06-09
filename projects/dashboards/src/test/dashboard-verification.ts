import { StaticProvider } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ColorService,
  FeatureState,
  FeatureStateResolver,
  LayoutChangeService,
  NavigationService,
  RelativeTimeRange,
  TimeDuration,
  TimeRangeService,
  TimeUnit
} from '@hypertrace/common';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { ModelJson } from '@hypertrace/hyperdash';
import { DashboardManagerService, LoggerService, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { GraphQlQueryEventService, MetadataService } from '@hypertrace/observability';
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
  mockProvider(GraphQlQueryEventService),
  mockProvider(ColorService),
  mockProvider(FeatureStateResolver, {
    getFeatureState: jest.fn().mockReturnValue(of(FeatureState.Disabled))
  }),
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
  // https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/55803#discussioncomment-1341954
  mockProvider(LoggerService, {
    warn: jest.fn().mockReturnValue(() => {
      throw new Error();
    }),
    info: jest.fn().mockReturnValue(() => {
      throw new Error();
    }),
    error: jest.fn().mockReturnValue(() => {
      throw new Error();
    })
  }),
  mockProvider(ActivatedRoute, {
    queryParamMap: EMPTY
  }),
  ...getMockFlexLayoutProviders()
];

export const rendererApiFactoryBuilder = <TModel extends object>(model: TModel) => () => ({
  getTimeRange: jest.fn(),
  model: model,
  change$: EMPTY,
  dataRefresh$: EMPTY,
  timeRangeChanged$: EMPTY
});

export const mockDashboardWidgetProviders: <T extends object>(model: T) => StaticProvider[] = model => [
  {
    provide: RENDERER_API,
    useFactory: rendererApiFactoryBuilder(model)
  },
  mockProvider(GraphQlRequestService, {
    query: jest.fn(() => EMPTY)
  }),
  mockProvider(ColorService),
  mockProvider(LayoutChangeService, {
    getLayoutChangeEventObservable: jest.fn().mockReturnValue(of({})),
    layout$: of()
  }),
  mockProvider(NavigationService, {
    navigation$: EMPTY,
    getAllValuesForQueryParameter: () => []
  }),
  ...getMockFlexLayoutProviders()
];
