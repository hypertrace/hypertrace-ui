import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule, LinkModule, ToggleGroupModule } from '@hypertrace/components';
import { CustomDashboardsViewComponent } from './custom-dashboards-view.component';
@NgModule({
  imports: [CommonModule, LinkModule, ButtonModule, ToggleGroupModule, RouterModule],
  declarations: [CustomDashboardsViewComponent]
})
export class CustomDashboardViewModule {}
