import { Pipe, PipeTransform } from '@angular/core';
import { FeatureState } from '@hypertrace/common';

@Pipe({
  name: 'htIsFeatureEnabled'
})
export class IsFeatureStateEnabledPipe implements PipeTransform {
  public transform(value?: FeatureState): boolean {
    return value === FeatureState.Enabled;
  }
}
