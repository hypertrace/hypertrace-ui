import { Injectable } from '@angular/core';
import {
  ApplicationFeature,
  ApplicationFeatureValues,
  DynamicConfigurationService,
  FeatureState,
  FeatureStateResolver
} from '@hypertrace/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class FeatureResolverService extends FeatureStateResolver {
  public constructor(private readonly dynamicConfigService: DynamicConfigurationService) {
    super();
  }
  public getFeatureState(flag: ApplicationFeatureValues): Observable<FeatureState> {
    return of(this.getConfigValue(flag));
  }
  private getConfigValue(flag: ApplicationFeatureValues): FeatureState {
    // Handle case where flag is not present in config.json
    if (!this.dynamicConfigService.isConfigPresentForFeature(flag)) {
      switch (flag) {
        case ApplicationFeature.PageTimeRange:
          return FeatureState.Disabled;
        case ApplicationFeature.InstrumentationQuality:
          return FeatureState.Disabled;
        case ApplicationFeature.SavedQueries:
          return FeatureState.Enabled;
        case ApplicationFeature.CustomDashboards:
          return FeatureState.Enabled;
        case ApplicationFeature.DeploymentMarkers:
          return FeatureState.Disabled;
        default:
          return FeatureState.Enabled;
      }
    }

    // tslint:disable-next-line: strict-boolean-expressions
    return this.dynamicConfigService.getValueForFeature(flag) ? FeatureState.Enabled : FeatureState.Disabled;
  }
}
