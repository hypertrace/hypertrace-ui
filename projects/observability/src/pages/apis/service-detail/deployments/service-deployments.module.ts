import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ServiceDeploymentsComponent } from './service-deployments.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ServiceDeploymentsComponent],
  exports: [ServiceDeploymentsComponent]
})
export class ServiceDeploymentsModule {}
