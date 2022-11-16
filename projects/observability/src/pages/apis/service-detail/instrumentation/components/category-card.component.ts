import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonRole, ButtonStyle } from '@hypertrace/components';
import { ServiceInstrumentationService } from '../service-instrumentation.service';
import { HeuristicClassScoreInfo } from '../service-instrumentation.types';

@Component({
  styleUrls: ['./category-card.component.scss'],
  selector: 'ht-service-instrumentation-category-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="service-instrumentation-category-card" [style.border-top-color]="this.scoreColor">
      <h5 class="heading">{{ this.heuristicClassScore?.name }}</h5>
      <p class="checks-status">{{ this.getNoOfChecksPassing() }}/{{ this.getTotalEligibleChecks() }} checks passing</p>

      <ht-service-instrumentation-progress-bar
        [score]="this.heuristicClassScore?.score"
      ></ht-service-instrumentation-progress-bar>

      <ht-service-instrumentation-progress-bar
        *ngIf="this.orgCategoryScores"
        label="Organization Average"
        [score]="this.getOrgScoreForCategory()"
      ></ht-service-instrumentation-progress-bar>

      <p class="description">{{ this.heuristicClassScore?.description }}</p>

      <div class="button-container">
        <ht-button
          label="See details"
          role="${ButtonRole.Tertiary}"
          display="${ButtonStyle.Bordered}"
          width="100%"
          (click)="this.onClickButton()"
        ></ht-button>
      </div>
    </div>
  `
})
export class CategoryCardComponent implements OnInit {
  @Input()
  public heuristicClassScore: HeuristicClassScoreInfo | undefined;

  @Input()
  public orgCategoryScores: HeuristicClassScoreInfo[] | undefined;

  public scoreColor: string = '';

  public constructor(
    private readonly serviceInstrumentationService: ServiceInstrumentationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  public ngOnInit(): void {
    this.scoreColor = this.serviceInstrumentationService.getColorForScore(this.heuristicClassScore?.score ?? 0).dark;
  }

  public getNoOfChecksPassing(): number {
    const failureThreshold = this.heuristicClassScore?.name === 'Security' ? 100 : 70;

    return (
      this.heuristicClassScore?.heuristicScoreInfo?.reduce(
        (accumulator, currentParam) => (currentParam.score >= failureThreshold ? accumulator + 1 : accumulator),
        0
      ) ?? 0
    );
  }

  public getTotalEligibleChecks(): number {
    // Checks with a score of -1 are skipped
    return (
      this.heuristicClassScore?.heuristicScoreInfo?.reduce(
        (accumulator, currentParam) => (currentParam.score >= 0 ? accumulator + 1 : accumulator),
        0
      ) ?? 0
    );
  }

  public getOrgScoreForCategory(): number {
    return this.orgCategoryScores?.find(score => score.name === this.heuristicClassScore?.name)?.score ?? 0;
  }

  public onClickButton(): void {
    this.router.navigate([this.heuristicClassScore?.name.toLowerCase()], { relativeTo: this.route });
  }
}
