import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DefaultConfigurationService } from '@hypertrace/hyperdash-angular';
import { DashboardPropertyEditorsModule } from './properties/dashboard-properties.module';
import { DashboardWidgetsModule } from './widgets/dashboard-widgets.module';

@NgModule({
  imports: [CommonModule, DashboardWidgetsModule, DashboardPropertyEditorsModule]
})
// tslint:disable-next-line: no-unnecessary-class
export class DashboardModule {
  public constructor(defaultConfigurationService: DefaultConfigurationService) {
    try {
      defaultConfigurationService.configure();
    } catch (e) {
      // Already configured - we've probably been lazy loaded and don't need to configure again
    }
  }
}
