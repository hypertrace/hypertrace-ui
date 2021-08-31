import { FreshPaintTelemetry } from './providers/freshpaint/freshpaint-provider';
import { FullStoryTelemetry } from './providers/fullstory/full-story-provider';
import { Injectable } from '@angular/core';
import { Dictionary } from '../utilities/types/types';
import { UserTelemetry, UserTelemetryConfig, UserTelemetryType, UserTraits } from './telemetry';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserTelemetryInternalService {
  private readonly registeredTelemetryProviderMap: Map<string, UserTelemetry> = new Map();
  private initializedTelemetryProviders: UserTelemetry[] = [];

  public constructor(private readonly router: Router) {}

  public register(config: UserTelemetryConfig): void {
    this.registeredTelemetryProviderMap.set(config.telemetryProvider, this.buildTelemetryProvider(config));
  }

  public initialize(): void {
    const allProviders = Array.from(this.registeredTelemetryProviderMap.values());

    allProviders
      .filter(telemetryProvider => !telemetryProvider.initialized)
      .forEach(telemetryProvider => telemetryProvider.initialize());

    this.initializedTelemetryProviders = allProviders.filter(telemetryProvider => telemetryProvider.initialized);
    this.maybeSetupPageTracking();
  }

  public identify(userTraits: UserTraits): void {
    this.initializedTelemetryProviders.forEach(telemetryProvider => telemetryProvider.identify(userTraits));
  }

  public shutdown(): void {
    this.initializedTelemetryProviders.forEach(telemetryProvider => telemetryProvider.shutdown());
  }

  public trackEvent(_name: string, _data: Dictionary<unknown>): void {
    this.initializedTelemetryProviders.forEach(telemetryProvider => telemetryProvider.shutdown());
  }

  public trackPageEvent(url: string): void {
    this.initializedTelemetryProviders.forEach(telemetryProvider => telemetryProvider.trackPage(url));
  }

  private buildTelemetryProvider(config: UserTelemetryConfig): UserTelemetry {
    switch (config.telemetryProvider) {
      case UserTelemetryType.FreshPaint:
        return new FreshPaintTelemetry(config);

      case UserTelemetryType.FullStory:
      default:
        return new FullStoryTelemetry(config);
    }
  }

  private maybeSetupPageTracking(): void {
    const enablePageTracking = this.initializedTelemetryProviders.some(provider => provider.config.enablePageTracking);

    if (enablePageTracking) {
      this.router.events
        .pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd),
          map(route => this.trackPageEvent(route.url))
        )
        .subscribe();
    }
  }
}
