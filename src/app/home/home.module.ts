import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HtRoute } from '@hypertrace/common';
import { NavigableDashboardModule, ObservabilityDashboardModule } from '@hypertrace/observability';
import { TotalErrorsLabelDataSourceModule } from './data/label/total-errors-label-data-source.module';
import { ObserveSystemRadarDataSourceModule } from './data/system/observe-system-radar-data-source.module';
import { HomeComponent } from './home.component';
import { homeDashboard } from './home.dashboard';

const ROUTE_CONFIG: HtRoute[] = [
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
