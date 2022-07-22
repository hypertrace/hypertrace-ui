import { Injectable } from '@angular/core';
import { ApplicationFeature, FeatureState, FeatureStateResolver } from '@hypertrace/common';
import { Observable, of } from 'rxjs';
import { DynamicConfigurationService } from '../dynamic-configuration/dynamic-configuration.service';

@Injectable()
export class FeatureResolverService extends FeatureStateResolver {
  public constructor(private readonly dynamicConfigService: DynamicConfigurationService) {
    super();
  }
  public getFeatureState(flag: string): Observable<FeatureState> {
    return of(this.getConfigValue(flag));
  }
  private getConfigValue(flag: string): FeatureState {
    // Handle case where flag is not present in config.json
    if (!this.dynamicConfigService.isConfigPresentForFeature(flag)) {
      switch (flag) {
        case ApplicationFeature.PageTimeRange:
          return FeatureState.Disabled;
        case ApplicationFeature.SavedQueries:
          return FeatureState.Enabled;
        default:
          return FeatureState.Enabled;
      }
    }

    // tslint:disable-next-line: strict-boolean-expressions
    return this.dynamicConfigService.getValueForFeature(flag) ? FeatureState.Enabled : FeatureState.Disabled;
  }
}
