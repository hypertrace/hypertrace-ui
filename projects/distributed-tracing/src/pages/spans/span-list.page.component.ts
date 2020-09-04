import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigableDashboardFilterConfig } from '../../shared/dashboard/dashboard-wrapper/navigable-dashboard.component';
import { SPAN_SCOPE } from '../../shared/graphql/model/schema/span';
import { spanListDashboard } from './span-list.page.dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-navigable-dashboard navLocation="${spanListDashboard.location}" [filterConfig]="this.filterConfig">
    </ht-navigable-dashboard>
  `
})
export class SpanListPageComponent {
  public readonly filterConfig: NavigableDashboardFilterConfig = {
    filterBar: { scope: SPAN_SCOPE }
  };
}
