import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadAsyncModule, TableModule, TraceSearchBoxModule } from '@hypertrace/components';
import { CustomDashboardListComponent } from './custom-dashboards.component';

@NgModule({
  imports: [CommonModule, LoadAsyncModule, TableModule, TraceSearchBoxModule],
  declarations: [CustomDashboardListComponent]
})
export class CustomDashboardListModule {}
