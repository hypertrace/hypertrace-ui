import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HtRoute } from '@hypertrace/common';
import {
  ApiDetailBreadcrumbResolver,
  ApiDetailService,
  EndpointListComponent,
  EndpointListModule
} from '@hypertrace/observability';

const ROUTE_CONFIG: HtRoute[] = [
  {
    path: '',
    component: EndpointListComponent
  },
  {
    path: `endpoint/:${ApiDetailService.API_ID_PARAM_NAME}`,
    resolve: {
      breadcrumb: ApiDetailBreadcrumbResolver
    },
    loadChildren: () =>
      import('./endpoint-detail/endpoint-detail-routing.module').then(module => module.EndpointDetailRoutingModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTE_CONFIG), EndpointListModule]
})
export class EndpointRoutingModule {}
