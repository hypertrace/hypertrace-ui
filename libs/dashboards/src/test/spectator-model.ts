import { InjectionToken, Provider, Type } from '@angular/core';
import { ModelApi } from '@hypertrace/hyperdash';
import { DashboardCoreModule, DefaultConfigurationService, ModelManagerService } from '@hypertrace/hyperdash-angular';
import { createServiceFactory, SpyObject } from '@ngneat/spectator/jest';

export const createModelFactory = (options: SpectatorModelFactoryOptions = {}): SpectatorModelFactory => {
  const serviceFactory = createServiceFactory({
    service: ModelManagerService,
    providers: options.providers || [],
    imports: [DashboardCoreModule, ...(options.imports || [])]
  });

  return <M extends object>(modelClass: Type<M>, overrides: SpectatorModelOverrides<M> = {}): SpectatorModel<M> => {
    const spectator = serviceFactory(overrides);
    spectator.service.registerModelApiBuilder({
      matches: () => !!overrides.api,
      build: () => overrides.api as ModelApi
    });
    spectator.inject(DefaultConfigurationService).configure();

    const model = spectator.service.construct<M>(modelClass);
    if (overrides.properties) {
      Object.assign(model, overrides.properties);
    }
    spectator.service.initialize(model);

    return {
      model: model,
      get: spectator.inject.bind(spectator)
    };
  };
};

export interface SpectatorModelFactoryOptions {
  providers?: Provider[];
  imports?: Type<unknown>[];
}

export interface SpectatorModelOverrides<M extends object> {
  // Replace getData with an untyped method which is easier to mock
  api?: Partial<Omit<ModelApi, 'getData'> & { getData(): unknown }>;
  providers?: Provider[];
  properties?: Partial<M>;
}

export interface SpectatorModel<M extends object> {
  model: M;
  get<T>(token: InjectionToken<T> | Type<T>): SpyObject<T>;
}

export type SpectatorModelFactory = <M extends object>(
  modelClass: Type<M>,
  overrides?: SpectatorModelOverrides<M>
) => SpectatorModel<M>;
