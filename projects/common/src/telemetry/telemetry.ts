import { InjectionToken } from '@angular/core';
import { Dictionary } from './../utilities/types/types';

export interface UserTelemetry {
  readonly config: UserTelemetryConfig;
  readonly initialized: boolean;
  initialize(): void;
  identify(userTraits: UserTraits): void;
  trackEvent(name: string, eventData: Dictionary<unknown>): void;
  trackPage(url: string): void;
  shutdown(): void;
}

export interface UserTraits extends Dictionary<unknown> {
  email: string;
  companyName: string;
  name: string;
  displayName: string;
}

export interface UserTelemetryConfig<TConfig extends TelemetryProviderConfig = TelemetryProviderConfig> {
  telemetryProvider: UserTelemetryType | string;
  telemetryProviderConfig: TConfig;
  enablePageTracking: boolean;
  enableEventTracking: boolean;
  enableErrorTracking: boolean;
}

export interface TelemetryProviderConfig {
  orgId: string;
}

export const enum UserTelemetryType {
  GTM = 'gtm',
  GoogleAnalytics = 'google-analytics',
  MixPanel = 'mixpanel',
  FreshPaint = 'freshpaint',
  FullStory = 'fullstory'
}

export const USER_TELEMETRY_PROVIDER_TOKENS = new InjectionToken<UserTelemetryConfig[][]>(
  'USER_TELEMETRY_PROVIDER_TOKENS'
);
