import { Dictionary } from '../../../utilities/types/types';
import { TelemetryProviderConfig, UserTelemetry, UserTelemetryConfig, UserTraits } from '../../telemetry';
import { loadGA } from './load-snippet';

export class FreshPaintTelemetry implements UserTelemetry {
  public initialized: boolean = false;

  public constructor(public readonly config: UserTelemetryConfig<TelemetryProviderConfig>) {}

  public initialize(): void {
    const ga = loadGA();
    ga('create', 'UA-XXXXX-Y', 'auto');
    ga('send', 'pageview');

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
