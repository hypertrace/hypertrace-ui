import { Injectable } from '@angular/core';
import { Dictionary } from '../../../utilities/types/types';

import { apiObject, identify, load, page, track } from 'rudder-sdk-js';
import { TelemetryProviderConfig, UserTelemetryProvider, UserTraits } from '../../telemetry';

export interface RudderStackConfig extends TelemetryProviderConfig {
  writeKey: string;
}

@Injectable({ providedIn: 'root' })
export class RudderStackTelemetry implements UserTelemetryProvider<RudderStackConfig> {
  public initialize(config: RudderStackConfig): void {
    load(config.writeKey, config.orgId, { configUrl: config.orgId });
  }

  public identify(userTraits: UserTraits): void {
    identify(undefined, userTraits as apiObject);
  }

  public trackEvent(name: string, eventData: Dictionary<unknown>): void {
    track(name, eventData as apiObject);
  }

  public trackPage(name: string, eventData: Dictionary<unknown>): void {
    page(name, name, eventData as apiObject);
  }

  public trackError(name: string, eventData: Dictionary<unknown>): void {
    this.trackEvent(name, eventData);
  }
}
