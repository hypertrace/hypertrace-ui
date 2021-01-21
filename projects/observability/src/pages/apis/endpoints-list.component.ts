import { ChangeDetectionStrategy, Component } from '@angular/core';
import { endpointsListDashboard } from './endpoints-list.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="vertical-flex-layout">
      <ht-page-header></ht-page-header>
      <ht-navigable-dashboard navLocation="${endpointsListDashboard.location}"></ht-navigable-dashboard>
    </div>
  `
})
export class EndpointsListComponent {}
