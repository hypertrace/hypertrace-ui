import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule, LinkModule, LoadAsyncModule, TableModule, TraceSearchBoxModule } from '@hypertrace/components';
import { CustomDashboardListComponent } from './custom-dashboards.component';

@NgModule({
  imports: [LinkModule, CommonModule, LoadAsyncModule, ButtonModule, TableModule, TraceSearchBoxModule],
  declarations: [CustomDashboardListComponent]
})
export class CustomDashboardListModule {}
