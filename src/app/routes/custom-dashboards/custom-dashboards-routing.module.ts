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
  CustomDashboardService,
  CustomDashboardsViewComponent,
  CustomDashboardViewModule,
  DASHBOARD_VIEWS
} from '@hypertrace/observability';

const ROUTE_CONFIG: HtRoute[] = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: DASHBOARD_VIEWS.MY_DASHBOARDS
      },
      {
        path: ':dashboard_view',
        component: CustomDashboardsViewComponent,
        children: [
          {
            path: '',
            component: CustomDashboardListComponent
          }
        ]
      }
    ]
  },

  {
    path: `:dashboard_view/:${CustomDashboardService.API_ID_PARAM_NAME}/panel/:panel_id`,
    component: CustomDashboardPanelEditComponent
  },
  {
    path: `:dashboard_view/:${CustomDashboardService.API_ID_PARAM_NAME}`,
    component: CustomDashboardDetailComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(ROUTE_CONFIG),
    CustomDashboardListModule,
    CustomDashboardPanelEditModule,
    CustomDashboardDetailModule,
    CustomDashboardViewModule
  ]
})
export class CustomDashboardsRoutingModule {}
