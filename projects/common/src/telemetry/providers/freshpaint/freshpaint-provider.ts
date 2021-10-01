import { Injectable } from '@angular/core';
import { TelemetryProviderConfig, UserTelemetryProvider, UserTraits } from '../../telemetry';
import { Dictionary } from './../../../utilities/types/types';
import { loadFreshPaint } from './load-snippet';
import { FreshPaint } from './load-snippet/index.d';

@Injectable({ providedIn: 'root' })
export class FreshPaintTelemetry<InitConfig extends TelemetryProviderConfig>
  implements UserTelemetryProvider<InitConfig> {
  private get freshPaint(): FreshPaint | undefined {
    return window.freshpaint;
  }

  public initialize(config: InitConfig): void {
    loadFreshPaint();
    this.freshPaint?.init(config.orgId);
  }

  public identify(userTraits: UserTraits): void {
    this.freshPaint?.identify(userTraits.email, userTraits);
    this.freshPaint?.addEventProperties(userTraits);
  }

  public trackEvent(name: string, properties: Dictionary<unknown>): void {
    this.freshPaint?.track(name, properties);
  }

  public trackPage(name: string, eventData: Dictionary<unknown>): void {
    this.freshPaint?.addPageviewProperties({ url: name, ...eventData });
    this.freshPaint?.page('product-ui', name, eventData);
    this.freshPaint?.track(name, eventData);
  }

  public trackError(name: string, eventData: Dictionary<unknown>): void {
    this.freshPaint?.track(name, eventData);
  }
}
