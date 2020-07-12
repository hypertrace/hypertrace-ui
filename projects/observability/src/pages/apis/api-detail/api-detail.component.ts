import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiDetailService, ApiType } from './api-detail.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./api-detail.component.scss'],
  providers: [ApiDetailService],
  template: `
    <htc-navigable-tab-group>
      <htc-navigable-tab path="overview">
        Overview
      </htc-navigable-tab>
      <htc-navigable-tab path="traces">
        Traces
      </htc-navigable-tab>
      <htc-navigable-tab path="metrics">
        Metrics
      </htc-navigable-tab>
    </htc-navigable-tab-group>
    <div class="tab-content">
      <router-outlet></router-outlet>
    </div>
  `
})
export class ApiDetailComponent {
  public readonly showApiDefinition$: Observable<boolean>;

  public constructor(apiDetailService: ApiDetailService) {
    this.showApiDefinition$ = apiDetailService.getEntity().pipe(map(api => api.apiType === ApiType.Http));
  }
}
