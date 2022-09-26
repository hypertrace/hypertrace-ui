import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ButtonModule, ProgressBarModule, ProgressCircleModule } from '@hypertrace/components';
import {
  CategoryCardComponent,
  InstrumentationDetailsComponent,
  InstrumentationOverviewComponent,
  OrgScoreComponent,
  ProgressBarComponent,
  TotalScoreComponent
} from './components';
import { ServiceInstrumentationComponent } from './service-instrumentation.component';

@NgModule({
  imports: [ButtonModule, CommonModule, ProgressBarModule, ProgressCircleModule, RouterModule],
  declarations: [
    ServiceInstrumentationComponent,
    CategoryCardComponent,
    InstrumentationDetailsComponent,
    InstrumentationOverviewComponent,
    OrgScoreComponent,
    ProgressBarComponent,
    TotalScoreComponent
  ],
  exports: [ServiceInstrumentationComponent]
})
export class ServiceInstrumentationModule {}
