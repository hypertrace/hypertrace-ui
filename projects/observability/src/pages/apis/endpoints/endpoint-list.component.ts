import { ChangeDetectionStrategy, Component } from '@angular/core';
import { endpointListDashboard } from './endpoint-list.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="vertical-flex-layout">
      <ht-page-header></ht-page-header>
      <ht-navigable-dashboard navLocation="${endpointListDashboard.location}"></ht-navigable-dashboard>
    </div>
  `
})
export class EndpointListComponent {}
