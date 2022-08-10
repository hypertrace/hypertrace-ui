import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HtRoute } from '@hypertrace/common';
import {
  CustomDashboardDetailComponent,
  CustomDashboardDetailModule,
  CustomDashboardListComponent,
  CustomDashboardListModule,
  CustomDashboardPanelEditComponent,
  CustomDashboardPanelEditModule,
  CustomDashboardService
} from '@hypertrace/observability';

const ROUTE_CONFIG: HtRoute[] = [
  {
    path: '',
    component: CustomDashboardListComponent
  },
  {
    path: `:${CustomDashboardService.API_ID_PARAM_NAME}/panel/:panel_id`,
    component: CustomDashboardPanelEditComponent
  },
  {
    path: `:${CustomDashboardService.API_ID_PARAM_NAME}`,
    component: CustomDashboardDetailComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(ROUTE_CONFIG),
    CustomDashboardListModule,
    CustomDashboardPanelEditModule,
    CustomDashboardDetailModule
  ]
})
export class CustomDashboardsRoutingModule {}
