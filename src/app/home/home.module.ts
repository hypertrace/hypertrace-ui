import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TraceRoute } from '@hypertrace/common';
import { ObservabilityDashboardModule } from '@hypertrace/observability';
import { GreetingMessageDataSourceModule } from './data/greeting-message/greeting-message-data-source.module';
import { ObserveSystemRadarDataSourceModule } from './data/system/observe-system-radar-data-source.module';
import { HomeComponent } from './home.component';

const ROUTE_CONFIG: TraceRoute[] = [
  {
    path: '',
    component: HomeComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(ROUTE_CONFIG),
    CommonModule,
    ObservabilityDashboardModule,
    ObserveSystemRadarDataSourceModule,
    GreetingMessageDataSourceModule
  ],
  declarations: [HomeComponent]
})
export class HomeModule {}
