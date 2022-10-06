import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ButtonRole, ButtonStyle } from '@hypertrace/components';
import { ServiceInstrumentationService } from '../service-instrumentation.service';
import { OrgScoreResponse, ServiceScoreResponse } from '../service-instrumentation.types';

@Component({
  styleUrls: ['./instrumentation-overview.component.scss'],
  selector: 'ht-service-instrumentation-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="top-content">
      <div class="overview">
        <ht-service-instrumentation-total-score
          [serviceScore]="(this.serviceScoreSubject | async)?.aggregatedWeightedScore"
        ></ht-service-instrumentation-total-score>

        <ht-service-instrumentation-org-score
          [orgScore]="this.orgScoreResponse?.aggregatedWeightedScore"
          *ngIf="this.showOrgScores"
        ></ht-service-instrumentation-org-score>
      </div>

      <ht-button
        [label]="this.getToggleLabel()"
        role="${ButtonRole.Primary}"
        display="${ButtonStyle.PlainText}"
        (click)="this.onClickShowOrgScores()"
      ></ht-button>
    </section>

    <section class="checks-container">
      <ht-service-instrumentation-category-card
        *ngFor="let heuristicClassScore of (serviceScoreSubject | async)?.heuristicClassScoreInfo"
        [heuristicClassScore]="heuristicClassScore"
        [orgCategoryScores]="this.showOrgScores && orgScoreResponse?.heuristicClassScoreInfo"
      ></ht-service-instrumentation-category-card>
    </section>
  `
})
export class InstrumentationOverviewComponent {
  public serviceScoreSubject: BehaviorSubject<ServiceScoreResponse | undefined> = new BehaviorSubject<
    ServiceScoreResponse | undefined
  >(undefined);

  public orgScoreResponse: OrgScoreResponse | undefined;
  public showOrgScores: boolean = false;

  public constructor(private readonly serviceInstrumentationService: ServiceInstrumentationService) {
    this.serviceScoreSubject = this.serviceInstrumentationService.serviceScoreSubject;
    this.serviceInstrumentationService.getOrgScore().subscribe(data => (this.orgScoreResponse = data));
  }

  public onClickShowOrgScores(): void {
    this.showOrgScores = !this.showOrgScores;
  }

  public getToggleLabel(): string {
    return `${this.showOrgScores ? 'Hide' : 'Show'} organization scores`;
  }
}
