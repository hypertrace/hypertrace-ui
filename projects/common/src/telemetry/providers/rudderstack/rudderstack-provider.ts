import { Injectable } from '@angular/core';
import { Dictionary } from '../../../utilities/types/types';

import * as rudderanalytics from 'rudder-sdk-js';
import { TelemetryProviderConfig, UserTelemetryProvider, UserTraits } from '../../telemetry';

@Injectable({ providedIn: 'root' })
export class RudderStackTelemetry<InitConfig extends TelemetryProviderConfig>
  implements UserTelemetryProvider<InitConfig> {
  public initialize(config: InitConfig): void {
    rudderanalytics.load(config.orgId, config.orgTrackingURL!);
  }

  public identify(userTraits: UserTraits): void {
    rudderanalytics.identify(undefined, userTraits as rudderanalytics.apiObject);
  }

  public trackEvent(name: string, eventData: Dictionary<unknown>): void {
    rudderanalytics.track(name, eventData as rudderanalytics.apiObject);
  }

  public trackPage(name: string, eventData: Dictionary<unknown>): void {
    rudderanalytics.page(name, name, eventData as rudderanalytics.apiObject);
  }

  public trackError(name: string, eventData: Dictionary<unknown>): void {
    this.trackEvent(name, eventData);
  }
}
