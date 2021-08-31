import { Dictionary } from '../../../utilities/types/types';
import { TelemetryProviderConfig, UserTelemetry, UserTelemetryConfig, UserTraits } from '../../telemetry';
import { loadFreshPaint } from './load-snippet';

export class FreshPaintTelemetry implements UserTelemetry {
  public initialized: boolean = false;

  public constructor(public readonly config: UserTelemetryConfig<TelemetryProviderConfig>) {}

  public initialize(): void {
    const freshPaint = loadFreshPaint();
    freshPaint.init(this.config.telemetryProviderConfig.orgId);
    freshPaint.page();

    this.initialized = true;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public identify(_userTraits: UserTraits): void {}

  public trackEvent(_name: string, _eventData: Dictionary<unknown>): void {}

  public trackPage(_url: string): void {
    if (this.config.enablePageTracking) {
    }
  }

  public shutdown(): void {}
}
