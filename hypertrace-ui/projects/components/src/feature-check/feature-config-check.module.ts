import { NgModule } from '@angular/core';
import { FeaturePipe } from './feature.pipe';
import { IfFeatureDirective } from './if-feature.directive';
import { IsFeatureStateEnabledPipe } from './is-feature-state-enabled.pipe';

@NgModule({
  declarations: [IfFeatureDirective, FeaturePipe, IsFeatureStateEnabledPipe],
  exports: [IfFeatureDirective, FeaturePipe, IsFeatureStateEnabledPipe],
})
export class FeatureConfigCheckModule {}
