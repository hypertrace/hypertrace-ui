import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TraceRoute } from '@hypertrace/common';
import { NavigableDashboardModule } from '@hypertrace/distributed-tracing';
import { ObservabilityDashboardModule } from '@hypertrace/observability';
import { TotalErrorsLabelDataSourceModule } from './data/label/total-errors-label-data-source.module';
import { ObserveSystemRadarDataSourceModule } from './data/system/observe-system-radar-data-source.module';
import { HomeComponent } from './home.component';
import { homeDashboard } from './home.dashboard';

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
    TotalErrorsLabelDataSourceModule,
    NavigableDashboardModule.withDefaultDashboards(homeDashboard)
  ],
  declarations: [HomeComponent]
})
export class HomeModule {}
