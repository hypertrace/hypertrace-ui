import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TraceRoute } from '@hypertrace/common';
import {
  ApiDetailBreadcrumbResolver,
  ApiDetailService,
  ServiceDetailBreadcrumbResolver,
  ServiceDetailService,
  ServiceListComponent,
  ServiceListModule
} from '@hypertrace/observability';

const ROUTE_CONFIG: TraceRoute[] = [
  {
    path: '',
    component: ServiceListComponent
  },
  {
    path: `service/:${ServiceDetailService.SERVICE_ID_PARAM_NAME}`,
    resolve: {
      breadcrumb: ServiceDetailBreadcrumbResolver
    },
    loadChildren: () =>
      import('./service-detail/service-detail-routing.module').then(module => module.ServiceDetailRoutingModule)
  },
  {
    path: `endpoint/:${ApiDetailService.API_ID_PARAM_NAME}`,
    resolve: {
      breadcrumb: ApiDetailBreadcrumbResolver
    },
    loadChildren: () =>
      import('../endpoints/endpoint-detail/endpoint-detail-routing.module').then(
        module => module.EndpointDetailRoutingModule
      )
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTE_CONFIG), ServiceListModule]
})
export class ServicesRoutingModule {}
