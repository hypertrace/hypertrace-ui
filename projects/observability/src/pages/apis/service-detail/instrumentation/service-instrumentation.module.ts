import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProgressCircleModule } from '@hypertrace/components';

import { CategoryCardComponent, OrgScoreComponent, TotalScoreComponent } from './components';
import { ServiceInstrumentationComponent } from './service-instrumentation.component';

@NgModule({
  imports: [CommonModule, ProgressCircleModule],
  declarations: [ServiceInstrumentationComponent, CategoryCardComponent, OrgScoreComponent, TotalScoreComponent],
  exports: [ServiceInstrumentationComponent]
})
export class ServiceInstrumentationModule {}
