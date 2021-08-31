import { Dictionary } from '../../../utilities/types/types';
import { TelemetryProviderConfig, UserTelemetry, UserTelemetryConfig, UserTraits } from './../../telemetry';
import * as FullStory from '@fullstory/browser';

export class FullStoryTelemetry implements UserTelemetry {
  public initialized: boolean = false;

  public constructor(public readonly config: UserTelemetryConfig<TelemetryProviderConfig>) {}

  public initialize(): void {
    FullStory.init({
      orgId: this.config.telemetryProviderConfig.orgId,
      devMode: false
    });

    this.initialized = true;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public identify(userTraits: UserTraits): void {
    FullStory.setUserVars({
      displayName: userTraits.name ?? `${userTraits.givenName} ${userTraits.familyName}`,
      email: userTraits.email,
      companyName: userTraits.companyName,
      licenseTier: userTraits.licenseTier,
      licenseExpiration: userTraits.licenseExpiration,
      isPlayground: userTraits.isPlayground,
      accountEmail: userTraits.accountEmail
    });
  }

  public trackEvent(name: string, eventData: Dictionary<unknown>): void {
    FullStory.event(name, eventData);
  }

  public trackPage(url: string): void {
    if (this.config.enablePageTracking) {
      FullStory.event(url, {});
    }
  }

  public shutdown(): void {
    FullStory.shutdown();
  }
}
