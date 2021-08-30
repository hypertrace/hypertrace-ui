import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InputModule, LabelModule, SelectModule } from '@hypertrace/components';
import { DashboardPropertyEditorsModule } from '@hypertrace/dashboards';

@NgModule({
  imports: [CommonModule, InputModule, LabelModule, SelectModule, DashboardPropertyEditorsModule]
})
export class TracingDashboardPropertyEditorsModule {}
