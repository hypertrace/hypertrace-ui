import { NgModule } from '@angular/core';
import { FeaturePipe } from './feature.pipe';
import { IfFeatureDirective } from './if-feature.directive';

@NgModule({
  declarations: [IfFeatureDirective, FeaturePipe],
  exports: [IfFeatureDirective, FeaturePipe]
})
export class FeatureConfigCheckModule {}
