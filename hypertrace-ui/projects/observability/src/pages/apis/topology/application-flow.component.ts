import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { TopologyLayoutType } from '../../../shared/components/topology/topology';
import { DashboardDefaultConfiguration } from '../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';
import { applicationFlowDefaultJson } from './application-flow.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="vertical-flex-layout">
      <ht-page-header></ht-page-header>
      <ht-navigable-dashboard [navLocation]="this.defaultJson.location" [variables]="this.variables">
      </ht-navigable-dashboard>
    </div>
  `,
})
export class ApplicationFlowComponent {
  public readonly defaultJson: DashboardDefaultConfiguration = applicationFlowDefaultJson;
  public variables: Dictionary<unknown> = { layoutType: TopologyLayoutType.CustomTreeLayout };
}
