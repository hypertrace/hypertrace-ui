import { Injectable, Injector, Optional } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
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

      // tslint:disable-next-line: no-console
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
  }

  public trackEvent(name: string, data: Dictionary<unknown>): void {
    this.initializedTelemetryProviders
      .filter(provider => provider.enableEventTracking)
      .forEach(provider => provider.telemetryProvider.trackEvent?.(name, data));
  }

  public trackPageEvent(url: string, data: Dictionary<unknown>): void {
    this.initializedTelemetryProviders
      .filter(provider => provider.enablePageTracking)
      .forEach(provider => provider.telemetryProvider.trackPage?.(url, data));
  }

  public trackErrorEvent(error: string, data: Dictionary<unknown>): void {
    this.initializedTelemetryProviders
      .filter(provider => provider.enableErrorTracking)
      .forEach(provider => provider.telemetryProvider.trackError?.(`Error: ${error}`, data));
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
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(route => this.trackPageEvent(`Visited: ${route.url}`, { url: route.url }));
  }
}

interface UserTelemetryInternalConfig<InitConfig = unknown> {
  telemetryProvider: UserTelemetryProvider<InitConfig>;
  initConfig: InitConfig;
  enablePageTracking: boolean;
  enableEventTracking: boolean;
  enableErrorTracking: boolean;
}
