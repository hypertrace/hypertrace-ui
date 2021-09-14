import { TelemetryProviderConfig, UserTelemetryProvider, UserTraits } from '../../telemetry';
import { loadGA } from './load-snippet';

export class GoogleAnalyticsTelemetry<InitConfig extends TelemetryProviderConfig>
  implements UserTelemetryProvider<InitConfig> {
  public initialize(config: InitConfig): void {
    const ga = loadGA();
    ga('create', config.orgId, 'auto');
    ga('send', 'pageview');
  }

  public identify(_userTraits: UserTraits): void {}
}
