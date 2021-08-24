import { Dictionary } from './../utilities/types/types';

export interface UserTelemetry {
  readonly config: UserTelemetryConfig;
  initialize(): void;
  identify(userTraits: UserTraits): void;
  trackEvent(name: string, eventData: Dictionary<unknown>): void;
  trackPage(): void;
}

export interface UserTraits extends Dictionary<unknown> {
  email: string;
  company: string;
  name: string;
  displayName: string;
}

export interface UserTelemetryConfig {
  type: UserTelemetryType;
  orgId: string;
  allowPageTracking: boolean;
  allowEventTracking: boolean;
  allowErrorTracking: boolean;
  enabled: boolean;
}

export const enum UserTelemetryType {
  GTM,
  GoogleAnalytics,
  MixPanel,
  FreshPaint,
  FullStory
}
