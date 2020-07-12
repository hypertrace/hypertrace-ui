import { RouterModule } from '@angular/router';

import { NgModule } from '@angular/core';
import { TraceRoute } from '@hypertrace/common';
import { ApplicationFlowComponent, ApplicationFlowModule } from '@hypertrace/observability';

const ROUTE_CONFIG: TraceRoute[] = [
  {
    path: '',
    component: ApplicationFlowComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTE_CONFIG), ApplicationFlowModule]
})
export class ApplicationFlowRoutingModule {}
