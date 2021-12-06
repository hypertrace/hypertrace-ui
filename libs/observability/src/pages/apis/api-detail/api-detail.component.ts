import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigableTab } from '@hypertrace/components';
import { ApiDetailService } from './api-detail.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ApiDetailService],
  template: `
    <div class="vertical-flex-layout">
      <ht-page-header [tabs]="this.tabs"></ht-page-header>
      <div class="scrollable-container">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class ApiDetailComponent {
  public readonly tabs: NavigableTab[] = [
    {
      path: 'overview',
      label: 'Overview'
    },
    {
      path: 'traces',
      label: 'Traces'
    },
    {
      path: 'metrics',
      label: 'Metrics'
    }
  ];
}
