import { TelemetryProviderConfig, UserTelemetryProvider, UserTraits } from '../../telemetry';
import { Dictionary } from './../../../utilities/types/types';
import { loadGA } from './load-snippet';

export class GoogleAnalyticsTelemetry<InitConfig extends TelemetryProviderConfig>
  implements UserTelemetryProvider<InitConfig>
{
  public initialize(config: InitConfig): void {
    const ga = loadGA();
    ga('create', config.orgId, 'auto');
    ga('send', 'pageview');
  }

  public identify(userTraits: UserTraits): void {
    ga('set', 'userId', userTraits.email);
  }

  public trackEvent(name: string, eventData: Dictionary<unknown>): void {
    ga('send', {
      hitType: 'event',
      eventCategory: 'user-actions',
      eventAction: name,
      ...eventData
    });
  }

  public trackPage(name: string, eventData: Dictionary<unknown>): void {
    ga('send', {
      hitType: 'pageview',
      page: name,
      ...eventData
    });
  }

  public trackError(name: string, eventData: Dictionary<unknown>): void {
    ga('send', {
      hitType: 'event',
      eventCategory: 'error',
      eventAction: name,
      ...eventData
    });
  }
}
