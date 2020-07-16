import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigableTab } from '@hypertrace/components';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiDetailService, ApiType } from './api-detail.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ApiDetailService],
  template: `
    <div class="vertical-flex-layout">
      <htc-page-header [tabs]="this.tabs"></htc-page-header>
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
      label: "Overview"
    },
    {
      path: 'traces',
      label: "Traces"
    },
    {
      path: 'metrics',
      label: "Metrics"
    }
  ]

  public readonly showApiDefinition$: Observable<boolean>;

  public constructor(apiDetailService: ApiDetailService) {
    this.showApiDefinition$ = apiDetailService.getEntity().pipe(map(api => api.apiType === ApiType.Http));
  }
}
