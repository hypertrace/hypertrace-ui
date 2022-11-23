import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
// tslint:disable-next-line: no-implicit-dependencies
import { CustomWindow } from 'src/app/root.module';
import { ApplicationFeatureValues } from '../public-api';

@Injectable({
  providedIn: 'root'
})
export class DynamicConfigurationService {
  private config!: UiConfiguration;
  public constructor(private readonly http: HttpClient) {}
  public load(): Observable<UiConfiguration> {
    return this.http.get<UiConfiguration>('/assets/json/config.json').pipe(
      tap((data: UiConfiguration) => {
        this.config = data;
        this.setupAnalyticsConfig();
      })
    );
  }
  public getValueForUrlConfig(key: string): string | undefined {
    return this.config?.urlConfig?.[key];
  }
  public isConfigPresentForFeature(feature: ApplicationFeatureValues): boolean {
    return this.config?.featureFlags?.hasOwnProperty(feature);
  }
  public getValueForFeature(feature: ApplicationFeatureValues): boolean {
    return this.config?.featureFlags?.[feature] ?? false;
  }
  public setupAnalyticsConfig(): void {
    (window as CustomWindow).analyticsConfig = this.config?.analyticsConfig;
  }
  // tslint:disable:no-any
  public getConfigurationForFeature(feature: ApplicationFeatureValues): any {
    return this.config.featureConfig[feature];
  }
}

interface UiConfiguration {
  featureFlags: FlagsConfig;
  urlConfig: UrlConfig;
  dashboardConfig: FlagsConfig;
  analyticsConfig: AnalyticsConfig;
  featureConfig: FeatureConfig;
}

type FlagsConfig = Record<ApplicationFeatureValues, boolean>;

interface UrlConfig {
  // tslint:disable:no-any
  [key: string]: any;
}

interface AnalyticsConfig {
  enabled: boolean;
  rudderstack_dataplane_url: string;
}

// tslint:disable:no-any
type FeatureConfig = Record<ApplicationFeatureValues, any>;
