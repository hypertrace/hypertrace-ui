import { APP_INITIALIZER, NgModule } from '@angular/core';
import { DynamicConfigurationService } from './dynamic-configuration.service';
@NgModule({
  providers: [
    DynamicConfigurationService,
    {
      provide: APP_INITIALIZER,
      useFactory: (ds: DynamicConfigurationService) => () => ds.load(),
      deps: [DynamicConfigurationService],
      multi: true
    }
  ]
})
export class DynamicConfigurationModule {}
