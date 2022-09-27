import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadAsyncModule, TableModule } from '@hypertrace/components';

import { ServiceDeploymentsListComponent } from './deployments-list/service-deployments-list.component';
import { ServiceDeploymentsComponent } from './service-deployments.component';
import { ServiceDeploymentsService } from './service-deployments.service';

@NgModule({
  imports: [CommonModule, LoadAsyncModule, TableModule],
  declarations: [ServiceDeploymentsComponent, ServiceDeploymentsListComponent],
  exports: [ServiceDeploymentsComponent],
  providers: [ServiceDeploymentsService]
})
export class ServiceDeploymentsModule {}
