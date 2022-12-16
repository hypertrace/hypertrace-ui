import { Injectable, Injector, Optional } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { delay, filter } from 'rxjs/operators';
import { getDifferenceInDays } from '../utilities/operations/operation-utilities';
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
    this.initializedTelemetryProviders = [];
  }

  public trackEvent(name: string, data: Dictionary<unknown>): void {
    this.initializedTelemetryProviders
      .filter(provider => provider.enableEventTracking)
      .forEach(provider =>
        provider.telemetryProvider.trackEvent?.(name, { ...data, eventCategory: UserTelemetryEvent.mouseEvent })
      );
  }

  public trackPageEvent(url: string, data: Dictionary<unknown>): void {
    this.initializedTelemetryProviders
      .filter(provider => provider.enablePageTracking)
      .forEach(provider =>
        provider.telemetryProvider.trackPage?.(url, { ...data, eventCategory: UserTelemetryEvent.navigate })
      );
  }

  public trackErrorEvent(error: string, data: Dictionary<unknown>): void {
    this.initializedTelemetryProviders
      .filter(provider => provider.enableErrorTracking)
      .forEach(provider =>
        provider.telemetryProvider.trackError?.(UserTelemetryEvent.error, {
          ...data,
          eventCategory: UserTelemetryEvent.error,
          errorMessage: error
        })
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
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        delay(50)
      )
      .subscribe(route => {
        const queryParamMap = this.router?.routerState.snapshot.root.queryParamMap;
        // Todo - Read from TimeRangeService.TIME_QUERY_PARAM once root cause for test case failure is identified
        const timeParamValue = queryParamMap?.get('time') ?? undefined;
        const isCustomTimeSelected = isCustomTime(timeParamValue);
        const rootObj = this.router?.parseUrl(route.url).root;
        const urlSegments = rootObj?.children?.primary?.segments.map(segment => segment.path) || [];
        this.trackPageEvent(UserTelemetryEvent.navigate, {
          url: route.url,
          ...queryParamMap,
          isCustomTime: isCustomTimeSelected,
          ...(isCustomTimeSelected ? { diffInDays: getDifferenceInDays(timeParamValue) } : {}),
          urlSegments: urlSegments,
          basePath: urlSegments.length >= 0 ? urlSegments[0] : undefined
        });
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

export enum UserTelemetryEvent {
  mouseEvent = 'mouse-event',
  navigate = 'user-navigation',
  error = 'error'
}

// This is temporary, will move this to fixed-time.range.ts once able to understand why test case was failing
// This is to move past test case for now
const isCustomTime = (time: undefined | string): boolean => (time !== undefined ? /(\d+)-(\d+)/.test(time) : false);
