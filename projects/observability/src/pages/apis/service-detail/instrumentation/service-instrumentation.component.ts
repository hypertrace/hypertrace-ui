import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BreadcrumbsService } from '@hypertrace/components';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServiceInstrumentationService } from './service-instrumentation.service';
import { OrgScoreResponse, ServiceScoreResponse } from './service-instrumentation.types';

@Component({
  styleUrls: ['./service-instrumentation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ServiceInstrumentationService],
  template: `
    <main class="service-instrumentation" *ngIf="this.serviceScoreSubject | async">
      <section class="overview">
        <ht-service-instrumentation-total-score
          [serviceScore]="(this.serviceScoreSubject | async)?.aggregatedWeightedScore"
        ></ht-service-instrumentation-total-score>

        <ht-service-instrumentation-org-score
          [orgScore]="(this.orgScoreResponse$ | async)?.aggregatedWeightedScore"
        ></ht-service-instrumentation-org-score>
      </section>

      <section class="checks-container">
        <ht-service-instrumentation-category-card
          *ngFor="let categoryScore of (serviceScoreSubject | async)?.qoiTypeScores"
        ></ht-service-instrumentation-category-card>
      </section>
    </main>
  `
})
export class ServiceInstrumentationComponent {
  public serviceScoreSubject: BehaviorSubject<ServiceScoreResponse | undefined> = new BehaviorSubject<
    ServiceScoreResponse | undefined
  >(undefined);

  public orgScoreResponse$: Observable<OrgScoreResponse>;

  public constructor(
    private readonly breadcrumbsService: BreadcrumbsService,
    private readonly serviceInstrumentationService: ServiceInstrumentationService
  ) {
    this.breadcrumbsService.breadcrumbs$
      .pipe(map(breadcrumbs => (breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1]?.label : undefined)))
      .subscribe(serviceName => {
        this.serviceInstrumentationService
          .getServiceScore(serviceName!)
          .subscribe(serviceScore => this.serviceScoreSubject.next(serviceScore));
      });

    this.orgScoreResponse$ = this.serviceInstrumentationService.getOrgScore();
  }
}
