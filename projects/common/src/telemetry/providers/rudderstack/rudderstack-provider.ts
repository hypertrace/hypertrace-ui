import { Injectable } from '@angular/core';
import { Dictionary } from '../../../utilities/types/types';

import { HttpClient } from '@angular/common/http';
import { apiObject, identify, load, page, track } from 'rudder-sdk-js';
import { TelemetryProviderConfig, UserTelemetryProvider, UserTraits } from '../../telemetry';

export interface RudderStackConfig extends TelemetryProviderConfig {
  writeKey: string;
}

@Injectable({ providedIn: 'root' })
export class RudderStackTelemetry implements UserTelemetryProvider<RudderStackConfig> {
  public constructor(private readonly http: HttpClient) {}

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
    this.http.get<UserTraits>('/user-info').subscribe(
      (data: UserTraits) => {
        identify(data.email, { email: data.email, name: data.name });
      },
      error => {
        // tslint:disable-next-line: no-console
        console.error('something went wrong in identify ', error);
      }
    );
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
