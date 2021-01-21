import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TraceRoute } from '@hypertrace/common';
import {
  ApiDetailBreadcrumbResolver,
  ApiDetailService,
  ServiceDetailBreadcrumbResolver,
  ServiceDetailService,
  EndpointsListComponent,
  EndpointsListModule
} from '@hypertrace/observability';

const ROUTE_CONFIG: TraceRoute[] = [
  {
    /*
     * The UI shouldn't link to /services directly from anywhere. Instead we use /endpoints. However, lets keep this
     * route active and instead show the user the EndpointsList (which also provides the only full list of services).
     */
    path: '',
    component: EndpointsListComponent
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
    loadChildren: () => import('../api-detail/api-detail-routing.module').then(module => module.ApiDetailRoutingModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTE_CONFIG), EndpointsListModule]
})
export class ServicesRoutingModule {}
