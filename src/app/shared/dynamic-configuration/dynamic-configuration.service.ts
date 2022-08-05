import { HttpClient } from '@angular/common/http';
import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { CustomWindow } from '../../root.module';

@Injectable({
  providedIn: 'root'
})
export class DynamicConfigurationService {
  private config!: UiConfiguration;
  public constructor(
    private readonly http: HttpClient,
    @SkipSelf() @Optional() private readonly sharedService?: DynamicConfigurationService
  ) {
    if (this.sharedService) {
      throw new Error('Config service already loaded');
    }
  }

  public load(): Observable<UiConfiguration> {
    return this.http.get<UiConfiguration>('/assets/json/config.json').pipe(
      tap((data: UiConfiguration) => {
        this.config = data;
        this.setupAnalyticsConfig();
      })
    );
  }

  public isConfigPresentForFeature(feature: string): boolean {
    return this.config?.featureFlags?.hasOwnProperty(feature);
  }
  public getValueForFeature(feature: string): string | number | boolean {
    return this.config?.featureFlags?.[feature];
  }
  public setupAnalyticsConfig(): void {
    (window as CustomWindow).analyticsConfig = this.config?.analyticsConfig;
  }
}

interface UiConfiguration {
  featureFlags: FlagsConfig;
  urlConfig: FlagsConfig;
  dashboardConfig: FlagsConfig;
  analyticsConfig: AnalyticsConfig;
}
interface FlagsConfig {
  [key: string]: string | boolean | number;
}
interface AnalyticsConfig {
  enabled: boolean;
  rudderstack_dataplane_url: string;
}
