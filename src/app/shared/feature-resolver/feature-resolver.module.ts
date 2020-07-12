import { NgModule } from '@angular/core';
import { FeatureStateResolver } from '@hypertrace/common';
import { FeatureResolverService } from './feature-resolver.service';

@NgModule({
  providers: [
    {
      provide: FeatureStateResolver,
      useClass: FeatureResolverService
    }
  ]
})
export class FeatureResolverModule {}
