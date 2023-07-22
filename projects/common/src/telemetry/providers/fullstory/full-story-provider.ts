import { Injectable } from '@angular/core';
import * as FullStory from '@fullstory/browser';
import { Dictionary } from '../../../utilities/types/types';
import { TelemetryProviderConfig, UserTelemetryProvider, UserTraits } from './../../telemetry';

@Injectable({ providedIn: 'root' })
export class FullStoryTelemetry<InitConfig extends TelemetryProviderConfig>
  implements UserTelemetryProvider<InitConfig> {
  public initialize(config: InitConfig): void {
    FullStory.init({
      orgId: config.orgId,
      devMode: false
    });
  }

  public identify(userTraits: UserTraits): void {
    FullStory.setUserVars({
      displayName: userTraits.name ?? `${userTraits.givenName as string} ${userTraits.familyName as string}`,
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

  public trackPage(name: string, eventData: Dictionary<unknown>): void {
    FullStory.event(name, eventData);
  }

  public trackError(name: string, eventData: Dictionary<unknown>): void {
    FullStory.event(name, eventData);
  }

  public shutdown(): void {
    FullStory.shutdown();
  }
}
