import { RouterModule } from '@angular/router';

import { NgModule } from '@angular/core';
import { HtRoute } from '@hypertrace/common';
import { ApplicationFlowComponent, ApplicationFlowModule } from '@hypertrace/observability';

const ROUTE_CONFIG: HtRoute[] = [
  {
    path: '',
    component: ApplicationFlowComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTE_CONFIG), ApplicationFlowModule]
})
export class ApplicationFlowRoutingModule {}
