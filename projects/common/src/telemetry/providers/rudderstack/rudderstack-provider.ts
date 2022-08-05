import { Injectable } from '@angular/core';
import { Dictionary } from '../../../utilities/types/types';

import { apiObject, identify, load, page, track } from 'rudder-sdk-js';
import { UserInfoService } from '../../../user/user-info.service';
import { TelemetryProviderConfig, UserTelemetryProvider } from '../../telemetry';

export interface RudderStackConfig extends TelemetryProviderConfig {
  writeKey: string;
}

@Injectable({ providedIn: 'root' })
export class RudderStackTelemetry implements UserTelemetryProvider<RudderStackConfig> {
  public constructor(private readonly userInfoService: UserInfoService) {}

  public initialize(config: RudderStackConfig): void {
    try {
      load(config.writeKey, config.orgId, { configUrl: config.orgId });
    } catch (error) {
      /**
       * Fail silently
       */

      // tslint:disable-next-line: no-console
      console.error('Failed to load Rudderstack', error);
    }
  }

  public identify(): void {
    const { email, name } = this.userInfoService.getUserData();
    identify(email, { email: email, name: name });
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
