import { Injectable, Injector } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Dictionary } from '../utilities/types/types';
import { UserTelemetryProvider, UserTelemetryRegistrationConfig, UserTraits } from './telemetry';

@Injectable({ providedIn: 'root' })
export class UserTelemetryInternalService {
  private telemetryProviders: UserTelemetryInternalConfig[] = [];
  private readonly telemetryActionSubject: Subject<TelemetryAction> = new ReplaySubject();
  private readonly telemetryAction$: Observable<TelemetryAction>;
  private readonly identifyAction$: Observable<TelemetryAction>;
  private readonly trackEventAction$: Observable<TelemetryAction>;
  private readonly trackPageAction$: Observable<TelemetryAction>;
  private readonly trackErrorAction$: Observable<TelemetryAction>;

  public constructor(private readonly injector: Injector, private readonly router: Router) {
    this.telemetryAction$ = this.telemetryActionSubject.asObservable();

    this.identifyAction$ = this.telemetryAction$.pipe(filter(action => action.type === TelemetryActionType.Identify));

    this.trackEventAction$ = this.telemetryAction$.pipe(
      filter(action => action.type === TelemetryActionType.TrackEvent)
    );

    this.trackPageAction$ = this.telemetryAction$.pipe(
      filter(action => action.type === TelemetryActionType.TrackPageView)
    );

    this.trackErrorAction$ = this.telemetryAction$.pipe(
      filter(action => action.type === TelemetryActionType.TrackError)
    );

    this.setupAutomaticPageTracking();
    this.setupTelemetryActionHandlers();
  }

  public register(...configs: UserTelemetryRegistrationConfig<unknown>[]): void {
    try {
      const providers = configs.map(config => this.buildTelemetryProvider(config));
      this.telemetryProviders = [...this.telemetryProviders, ...providers];
    } catch (error) {
      /**
       * Fail silently
       */
    }
  }

  public identify(userTraits: UserTraits): void {
    this.telemetryActionSubject.next({ type: TelemetryActionType.Identify, data: userTraits });
  }

  public shutdown(): void {
    this.telemetryActionSubject.next({ type: TelemetryActionType.Shutdown });
  }

  public trackEvent(name: string, data: Dictionary<unknown>): void {
    this.telemetryActionSubject.next({ type: TelemetryActionType.TrackEvent, name: name, data: data });
  }

  public trackPageEvent(url: string, data: Dictionary<unknown>): void {
    this.telemetryActionSubject.next({ type: TelemetryActionType.TrackPageView, name: url, data: data });
  }

  public trackErrorEvent(error: string, data: Dictionary<unknown>): void {
    this.telemetryActionSubject.next({ type: TelemetryActionType.TrackError, name: error, data: data });
  }

  private buildTelemetryProvider(config: UserTelemetryRegistrationConfig<unknown>): UserTelemetryInternalConfig {
    const providerInstance = this.injector.get(config.telemetryProvider);
    providerInstance.initialize(config.initConfig);

    return {
      ...config,
      telemetryProvider: providerInstance
    };
  }

  private setupTelemetryActionHandlers(): void {
    this.setupIdentifyHandler();
    this.setupTrackEventHandler();
    this.setupTrackPageHandler();
    this.setupTrackErrorHandler();
  }

  private setupIdentifyHandler(): void {
    this.identifyAction$.subscribe(action =>
      this.telemetryProviders.forEach(provider => provider.telemetryProvider.identify(action.data as UserTraits))
    );
  }

  private setupTrackEventHandler(): void {
    this.trackEventAction$.subscribe(action =>
      this.telemetryProviders
        .filter(provider => provider.enableEventTracking)
        .forEach(provider => provider.telemetryProvider.trackEvent?.(action.name!, action.data!))
    );
  }

  private setupTrackPageHandler(): void {
    this.trackPageAction$.subscribe(action =>
      this.telemetryProviders
        .filter(provider => provider.enablePageTracking)
        .forEach(provider => provider.telemetryProvider.trackPage?.(action.name!, action.data!))
    );
  }

  private setupTrackErrorHandler(): void {
    this.trackErrorAction$.subscribe(action =>
      this.telemetryProviders
        .filter(provider => provider.enableErrorTracking)
        .forEach(provider => provider.telemetryProvider.trackError?.(`Error: ${action.name!}`, action.data!))
    );
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

interface TelemetryAction {
  type: TelemetryActionType;
  name?: string;
  data?: Dictionary<unknown>;
}

const enum TelemetryActionType {
  Identify,
  TrackPageView,
  TrackEvent,
  TrackError,
  Shutdown
}
