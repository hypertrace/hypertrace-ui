import { Injectable, Injector, Optional } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { isEmpty } from 'lodash-es';
import { delay, filter } from 'rxjs/operators';
import { HtRouteData } from '../navigation/ht-route-data';
import { Dictionary } from '../utilities/types/types';
import { UserTelemetryProvider, UserTelemetryRegistrationConfig, UserTraits } from './telemetry';
import { UserTelemetryService } from './user-telemetry.service';

@Injectable({ providedIn: 'root' })
export class UserTelemetryImplService extends UserTelemetryService {
  private allTelemetryProviders: UserTelemetryInternalConfig[] = [];
  private initializedTelemetryProviders: UserTelemetryInternalConfig[] = [];

  public constructor(private readonly injector: Injector, @Optional() private readonly router?: Router) {
    super();
    this.setupAutomaticPageTracking();
  }

  public register(...configs: UserTelemetryRegistrationConfig<unknown>[]): void {
    try {
      const providers = configs.map(config => this.buildTelemetryProvider(config));
      this.allTelemetryProviders = [...this.allTelemetryProviders, ...providers];
    } catch (error) {
      /**
       * Fail silently
       */

      // eslint-disable-next-line  no-console
      console.error(error);
    }
  }

  public initialize(): void {
    this.allTelemetryProviders.forEach(provider => provider.telemetryProvider.initialize(provider.initConfig));
    this.initializedTelemetryProviders = [...this.allTelemetryProviders];
  }

  public identify(userTraits: UserTraits): void {
    this.initializedTelemetryProviders.forEach(provider => provider.telemetryProvider.identify(userTraits));
  }

  public shutdown(): void {
    this.initializedTelemetryProviders.forEach(provider => provider.telemetryProvider.shutdown?.());
    this.initializedTelemetryProviders = [];
  }

  public trackEvent(name: string, data: Dictionary<unknown>): void {
    this.initializedTelemetryProviders
      .filter(provider => provider.enableEventTracking)
      .forEach(provider => provider.telemetryProvider.trackEvent?.(name, { ...data, eventCategory: 'user-action' }));
  }

  public trackPageEvent(url: string, data: Dictionary<unknown>): void {
    this.initializedTelemetryProviders
      .filter(provider => provider.enablePageTracking)
      .forEach(provider => provider.telemetryProvider.trackPage?.(url, { ...data, eventCategory: 'page-view' }));
  }

  public trackErrorEvent(error: string, data: Dictionary<unknown>): void {
    this.initializedTelemetryProviders
      .filter(provider => provider.enableErrorTracking)
      .forEach(provider =>
        provider.telemetryProvider.trackError?.(`Error: ${error}`, { ...data, eventCategory: 'error' })
      );
  }

  private buildTelemetryProvider(config: UserTelemetryRegistrationConfig<unknown>): UserTelemetryInternalConfig {
    const providerInstance = this.injector.get(config.telemetryProvider);

    return {
      ...config,
      telemetryProvider: providerInstance
    };
  }

  private setupAutomaticPageTracking(): void {
    this.router?.events
      .pipe(
        filter((event): event is ActivationEnd => event instanceof ActivationEnd),
        delay(50)
      )
      .subscribe(event => {
        const url = event.snapshot.pathFromRoot
          .map(snapshot => snapshot.routeConfig?.path)
          .filter(path => !isEmpty(path))
          .join('/');
        const title = (event.snapshot.data as HtRouteData).title ?? url;
        const queryParams = event.snapshot.queryParams;

        this.trackPageEvent(`${url}`, { url: url, title: title, ...queryParams });
      });
  }
}

interface UserTelemetryInternalConfig<InitConfig = unknown> {
  telemetryProvider: UserTelemetryProvider<InitConfig>;
  initConfig: InitConfig;
  enablePageTracking: boolean;
  enableEventTracking: boolean;
  enableErrorTracking: boolean;
}
