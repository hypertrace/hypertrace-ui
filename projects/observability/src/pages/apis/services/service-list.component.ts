import { ChangeDetectionStrategy, Component } from '@angular/core';
import { servicesListDashboard } from './services-list.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="vertical-flex-layout">
      <ht-page-header></ht-page-header>
      <ht-navigable-dashboard navLocation="${servicesListDashboard.location}"></ht-navigable-dashboard>
    </div>
  `
})
export class ServiceListComponent {}
