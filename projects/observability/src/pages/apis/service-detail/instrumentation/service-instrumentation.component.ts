import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BreadcrumbsService } from '@hypertrace/components';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  styleUrls: ['./service-instrumentation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="service-instrumentation">
      <section class="overview">
        <div>{{ this.serviceName$ | async }} progress circle and description</div>
        <div>org scores</div>
      </section>

      <section class="checks-container">
        <div>card1</div>
        <div>card2</div>
        <div>card3</div>
        <div>card4</div>
      </section>
    </main>
  `
})
export class ServiceInstrumentationComponent {
  public serviceName$: Observable<string | undefined> = this.breadcrumbsService.breadcrumbs$.pipe(
    map(breadcrumbs => (breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1]?.label : ''))
  );

  public constructor(protected readonly breadcrumbsService: BreadcrumbsService) {}
}
