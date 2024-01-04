import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModelJson } from '@hypertrace/hyperdash';
import { backendListDashboard } from './backend-list.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="vertical-flex-layout">
      <ht-page-header></ht-page-header>
      <ht-navigable-dashboard [navLocation]="this.location" [defaultJson]="this.defaultJson"> </ht-navigable-dashboard>
    </div>
  `,
})
export class BackendListComponent {
  public readonly location: string = backendListDashboard.location;
  public readonly defaultJson: ModelJson = backendListDashboard.json;
}
