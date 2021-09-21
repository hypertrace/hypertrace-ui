import { ProviderToken } from '@angular/core';
import { Dictionary } from './../utilities/types/types';

export interface UserTelemetryRegistrationConfig<TInitConfig> {
  telemetryProvider: ProviderToken<UserTelemetryProvider<TInitConfig>>;
  initConfig: TInitConfig;
  enablePageTracking: boolean;
  enableEventTracking: boolean;
  enableErrorTracking: boolean;
}

export interface UserTelemetryProvider<TInitConfig = unknown> {
  initialize(config: TInitConfig): void;
  identify(userTraits: UserTraits): void;
  trackEvent?(name: string, eventData: Dictionary<unknown>): void;
  trackPage?(url: string, eventData: Dictionary<unknown>): void;
  trackError?(error: string, eventData: Dictionary<unknown>): void;
  shutdown?(): void;
}

export interface TelemetryProviderConfig {
  orgId: string;
}

export interface UserTraits extends Dictionary<unknown> {
  email?: string;
  companyName?: string;
  name?: string;
  displayName?: string;
}
