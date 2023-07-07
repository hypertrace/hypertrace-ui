import { NgModule } from '@angular/core';
import { FeaturePipe } from './feature.pipe';
import { IfFeatureDirective } from './if-feature.directive';
import { IsFeatureStateEnabled } from './is-feature-state-enabled.pipe';

@NgModule({
  declarations: [IfFeatureDirective, FeaturePipe, IsFeatureStateEnabled],
  exports: [IfFeatureDirective, FeaturePipe, IsFeatureStateEnabled]
})
export class FeatureConfigCheckModule {}
