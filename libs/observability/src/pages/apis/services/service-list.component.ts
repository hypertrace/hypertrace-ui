import { ChangeDetectionStrategy, Component } from '@angular/core';
import { serviceListDashboard } from './service-list.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="vertical-flex-layout">
      <ht-page-header></ht-page-header>
      <ht-navigable-dashboard navLocation="${serviceListDashboard.location}"></ht-navigable-dashboard>
    </div>
  `
})
export class ServiceListComponent {}
