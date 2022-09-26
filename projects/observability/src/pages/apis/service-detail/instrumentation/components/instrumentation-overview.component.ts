import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ServiceInstrumentationService } from '../service-instrumentation.service';
import { OrgScoreResponse, ServiceScoreResponse } from '../service-instrumentation.types';

@Component({
  styleUrls: ['./instrumentation-overview.component.scss'],
  selector: 'ht-service-instrumentation-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
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
        [categoryScore]="categoryScore"
        [orgCategoryScores]="(orgScoreResponse$ | async)?.qoiTypeScores"
      ></ht-service-instrumentation-category-card>
    </section>
  `
})
export class InstrumentationOverviewComponent {
  public serviceScoreSubject: BehaviorSubject<ServiceScoreResponse | undefined> = new BehaviorSubject<
    ServiceScoreResponse | undefined
  >(undefined);

  public orgScoreResponse$: Observable<OrgScoreResponse>;

  public constructor(private readonly serviceInstrumentationService: ServiceInstrumentationService) {
    this.serviceScoreSubject = this.serviceInstrumentationService.serviceScoreSubject;
    this.orgScoreResponse$ = this.serviceInstrumentationService.getOrgScore();
  }
}
