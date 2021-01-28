import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule } from '@angular/router';
import { IconType } from '@hypertrace/assets-library';
import { ExternalUrlNavigator, TraceRoute } from '@hypertrace/common';
import { NotFoundComponent, NotFoundModule } from '@hypertrace/components';
import { ObservabilityIconType } from '@hypertrace/observability';
import { ApplicationFrameComponent } from '../application-frame/application-frame.component';

const ROUTE_CONFIG: TraceRoute[] = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ApplicationFrameComponent,
        children: [
          {
            path: '',
            redirectTo: 'home',
            pathMatch: 'full'
          },
          {
            path: 'home',
            data: {
              breadcrumb: {
                icon: IconType.Dashboard,
                label: 'Dashboard'
              }
            },
            loadChildren: () => import('../home/home.module').then(module => module.HomeModule)
          },
          {
            path: 'application-flow',
            data: {
              breadcrumb: {
                icon: ObservabilityIconType.ApplicationFlow,
                label: 'Application Flow'
              }
            },
            loadChildren: () =>
              import('./application-flow/application-flow-routing.module').then(
                module => module.ApplicationFlowRoutingModule
              )
          },
          {
            path: 'backends',
            data: {
              breadcrumb: {
                icon: ObservabilityIconType.Backend,
                label: 'Backends'
              }
            },
            loadChildren: () =>
              import('./backends/backends-routing.module').then(module => module.BackendsRoutingModule)
          },
          {
            path: 'services',
            data: {
              breadcrumb: {
                icon: ObservabilityIconType.Service,
                label: 'Services'
              }
            },
            loadChildren: () =>
              import('./services/services-routing.module').then(module => module.ServicesRoutingModule)
          },
          {
            path: 'endpoints',
            data: {
              breadcrumb: {
                icon: ObservabilityIconType.Api,
                label: 'Endpoints'
              }
            },
            loadChildren: () =>
              import('./endpoints/endpoint-routing.module').then(module => module.EndpointRoutingModule)
          },
          {
            path: 'trace',
            loadChildren: () => import('@hypertrace/distributed-tracing').then(module => module.TraceDetailPageModule)
          },
          {
            path: 'api-trace',
            loadChildren: () => import('@hypertrace/observability').then(module => module.ApiTraceDetailPageModule)
          },
          {
            path: 'explorer',
            data: {
              breadcrumb: {
                icon: IconType.Search,
                label: 'Explorer'
              }
            },
            loadChildren: () =>
              import('./explorer/explorer-routing.module').then(module => module.ExplorerRoutingModule)
          },
          {
            path: 'error',
            component: NotFoundComponent
          }
        ]
      },
      {
        path: 'external',
        canActivate: [ExternalUrlNavigator],
        component: NotFoundComponent // Not actually used, but required by router
      },
      {
        path: '**',
        redirectTo: 'error',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [
    NotFoundModule,
    RouterModule.forRoot(ROUTE_CONFIG, {
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class RootRoutingModule {}
