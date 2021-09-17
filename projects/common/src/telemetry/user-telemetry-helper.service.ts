import { Injectable, Injector } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Dictionary } from '../utilities/types/types';
import { UserTelemetryProvider, UserTelemetryRegistrationConfig, UserTraits } from './telemetry';

@Injectable({ providedIn: 'root' })
export class UserTelemetryHelperService {
  private telemetryProviders: UserTelemetryInternalConfig[] = [];

  public constructor(private readonly injector: Injector, private readonly router: Router) {
    this.setupAutomaticPageTracking();
  }

  public register(...configs: UserTelemetryRegistrationConfig<unknown>[]): void {
    try {
      const providers = configs.map(config => this.buildTelemetryProvider(config));
      this.telemetryProviders = [...this.telemetryProviders, ...providers];
    } catch (error) {
      /**
       * Fail silently
       */
      console.error(error);
    }
  }

  public initialize(): void {
    this.telemetryProviders.forEach(provider => provider.telemetryProvider.initialize(provider.initConfig));
  }

  public identify(userTraits: UserTraits): void {
    this.telemetryProviders.forEach(provider => provider.telemetryProvider.identify(userTraits));
  }

  public shutdown(): void {
    this.telemetryProviders.forEach(provider => provider.telemetryProvider.shutdown?.());
  }

  public trackEvent(name: string, data: Dictionary<unknown>): void {
    this.telemetryProviders
      .filter(provider => provider.enableEventTracking)
      .forEach(provider => provider.telemetryProvider.trackEvent?.(name, data));
  }

  public trackPageEvent(url: string, data: Dictionary<unknown>): void {
    this.telemetryProviders
      .filter(provider => provider.enablePageTracking)
      .forEach(provider => provider.telemetryProvider.trackPage?.(url, data));
  }

  public trackErrorEvent(error: string, data: Dictionary<unknown>): void {
    this.telemetryProviders
      .filter(provider => provider.enableErrorTracking)
      .forEach(provider => provider.telemetryProvider.trackError?.(`Error: ${error}`, data));
  }

  private buildTelemetryProvider(config: UserTelemetryRegistrationConfig<unknown>): UserTelemetryInternalConfig {
    const providerInstance = this.injector.get(config.telemetryProvider);
    providerInstance.initialize(config.initConfig);

    return {
      ...config,
      telemetryProvider: providerInstance
    };
  }

  private setupAutomaticPageTracking(): void {
    this.router.events
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
