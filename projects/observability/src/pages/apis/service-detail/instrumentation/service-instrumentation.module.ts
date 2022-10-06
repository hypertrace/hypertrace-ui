import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';

import {
  ButtonModule,
  IconModule,
  LoadAsyncModule,
  ProgressBarModule,
  ProgressCircleModule
} from '@hypertrace/components';
import {
  CategoryCardComponent,
  InstrumentationDetailsComponent,
  InstrumentationOverviewComponent,
  OrgScoreComponent,
  PanelContentComponent,
  ProgressBarComponent,
  TotalScoreComponent
} from './components';
import { ServiceInstrumentationComponent } from './service-instrumentation.component';

@NgModule({
  imports: [
    ButtonModule,
    CommonModule,
    MatExpansionModule,
    IconModule,
    LoadAsyncModule,
    ProgressBarModule,
    ProgressCircleModule,
    RouterModule
  ],
  declarations: [
    ServiceInstrumentationComponent,
    CategoryCardComponent,
    InstrumentationDetailsComponent,
    InstrumentationOverviewComponent,
    OrgScoreComponent,
    PanelContentComponent,
    ProgressBarComponent,
    TotalScoreComponent
  ],
  exports: [ServiceInstrumentationComponent]
})
export class ServiceInstrumentationModule {}
