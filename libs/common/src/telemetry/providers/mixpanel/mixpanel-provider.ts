import { Injectable } from '@angular/core';
import mixpanel from 'mixpanel-browser';
import { Dictionary } from '../../../utilities/types/types';
import { TelemetryProviderConfig, UserTelemetryProvider, UserTraits } from '../../telemetry';

@Injectable({ providedIn: 'root' })
export class MixPanelTelemetry<InitConfig extends TelemetryProviderConfig>
  implements UserTelemetryProvider<InitConfig> {
  public initialize(config: InitConfig): void {
    mixpanel.init(config.orgId);
  }

  public identify(userTraits: UserTraits): void {
    mixpanel.identify(userTraits.email);
    mixpanel.people.set({
      displayName: userTraits.name ?? `${String(userTraits.givenName)} ${String(userTraits.familyName)}`,
      email: userTraits.email,
      companyName: userTraits.companyName,
      licenseTier: userTraits.licenseTier,
      licenseExpiration: userTraits.licenseExpiration,
      isPlayground: userTraits.isPlayground,
      accountEmail: userTraits.accountEmail
    });
  }

  public trackEvent(name: string, eventData: Dictionary<unknown>): void {
    mixpanel.track(name, eventData);
  }

  public trackPage(name: string, eventData: Dictionary<unknown>): void {
    mixpanel.track(name, eventData);
  }

  public trackError(name: string, eventData: Dictionary<unknown>): void {
    mixpanel.track(name, eventData);
  }

  public shutdown(): void {
    mixpanel.disable();
  }
}
