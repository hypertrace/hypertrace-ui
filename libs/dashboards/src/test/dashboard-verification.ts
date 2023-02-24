import { StaticProvider } from '@angular/core';
import { ColorService, LayoutChangeService, NavigationService } from '@hypertrace/common';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { ModelJson } from '@hypertrace/hyperdash';
import { DashboardManagerService, RENDERER_API } from '@hypertrace/hyperdash-angular';
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

export const rendererApiFactoryBuilder =
  <TModel extends object>(model: TModel) =>
  () => ({
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
