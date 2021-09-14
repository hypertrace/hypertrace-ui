import { Dictionary } from './../../../utilities/types/types';
import { Injectable } from '@angular/core';
import { TelemetryProviderConfig, UserTelemetryProvider, UserTraits } from '../../telemetry';
import { FreshPaint, loadFreshPaint } from './load-snippet';

@Injectable({ providedIn: 'root' })
export class FreshPaintTelemetry<InitConfig extends TelemetryProviderConfig>
  implements UserTelemetryProvider<InitConfig> {
  private freshPaint?: FreshPaint;

  public initialize(config: InitConfig): void {
    this.freshPaint = loadFreshPaint();
    this.freshPaint.init(config.orgId);
    // this.freshPaint.page();
  }

  public identify(userTraits: UserTraits): void {
    this.freshPaint?.identify(userTraits.email, userTraits);
    this.freshPaint?.addEventProperties(userTraits);
  }

  public trackEvent(name: string, properties: Dictionary<unknown>): void {
    this.freshPaint!.track(name, properties);
  }

  public trackPage(name: string, eventData: Dictionary<unknown>): void {
    this.freshPaint!.track(name, eventData);
  }
}
