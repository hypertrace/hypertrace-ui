import { Injectable, Injector, OnDestroy } from '@angular/core';
import { Dictionary } from '../utilities/types/types';
import { UserTelemetryProvider, UserTelemetryRegistrationConfig, UserTraits } from './telemetry';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Observable, ReplaySubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserTelemetryInternalService implements OnDestroy {
  private telemetryProviders: UserTelemetryProvider[] = [];
  private readonly telemetryActionSubject: Subject<TelemetryAction> = new ReplaySubject();
  private readonly telemetryAction$: Observable<TelemetryAction> = this.telemetryActionSubject.pipe();

  private readonly destroyedSubject: ReplaySubject<void> = new ReplaySubject();

  public constructor(private readonly injector: Injector, private readonly router: Router) {
    this.setupAutomaticPageTracking();
    this.setupAutomaticErrorTracking();
    this.setupTelemetryActionHandlers();
  }

  public ngOnDestroy(): void {
    this.destroyedSubject.next();
    this.destroyedSubject.complete();
  }

  public register(...configs: UserTelemetryRegistrationConfig<unknown>[]): void {
    try {
      const providers = configs.map(config => this.buildTelemetryProvider(config));
      this.telemetryProviders = [...this.telemetryProviders, ...providers];
    } catch (error) {
      console.trace(error);
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

  private buildTelemetryProvider(config: UserTelemetryRegistrationConfig<unknown>): UserTelemetryProvider {
    const provider = this.injector.get(config.telemetryProvider);
    provider.initialize(config.initConfig);

    return provider;
  }

  private setupTelemetryActionHandlers(): void {
    this.setupIdentifyHandler();
    this.setupTrackEventHandler();
    this.setupTrackPageHandler();
    this.setupTrackErrorHandler();
  }

  private setupIdentifyHandler(): void {
    this.telemetryAction$
      .pipe(
        filter(action => action.type === TelemetryActionType.Identify),
        map(action => this.telemetryProviders.forEach(provider => provider.identify(action.data as UserTraits))),
        takeUntil(this.destroyedSubject)
      )
      .subscribe();
  }

  private setupTrackEventHandler(): void {
    this.telemetryAction$
      .pipe(
        filter(action => action.type === TelemetryActionType.TrackEvent),
        map(action => this.telemetryProviders.forEach(provider => provider.trackEvent?.(action.name!, action.data!))),
        takeUntil(this.destroyedSubject)
      )
      .subscribe();
  }

  private setupTrackPageHandler(): void {
    this.telemetryAction$
      .pipe(
        filter(action => action.type === TelemetryActionType.TrackPageView),
        map(action => this.telemetryProviders.forEach(provider => provider.trackPage?.(action.name!, action.data!))),
        takeUntil(this.destroyedSubject)
      )
      .subscribe();
  }

  private setupTrackErrorHandler(): void {
    this.telemetryAction$
      .pipe(
        filter(action => action.type === TelemetryActionType.TrackError),
        map(action => this.telemetryProviders.forEach(provider => provider.trackError?.(action.name!, action.data!))),
        takeUntil(this.destroyedSubject)
      )
      .subscribe();
  }

  private setupAutomaticPageTracking(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(route => this.trackPageEvent(`Visited: ${route.url}`, { url: route.url })),
        takeUntil(this.destroyedSubject)
      )
      .subscribe();
  }

  private setupAutomaticErrorTracking(): void {
    //   const trackError = this.trackErrorEvent;
    //   window.onerror = function(msg, url, lineNo, columnNo, error){
    //     console.log(`Error: ${msg}, url:${url}, lineNo: ${lineNo}, columnNo: ${columnNo}, error: ${error}`);
    //     trackError(`Error: ${msg}, url:${url}, lineNo: ${lineNo}, columnNo: ${columnNo}, error: ${error}`, {msg, url, lineNo, columnNo, error, stack: error?.stack});
    //     return false;
    //   }
  }
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
