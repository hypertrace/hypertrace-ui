import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IconType } from '@hypertrace/assets-library';
import { ButtonRole, ButtonStyle } from '@hypertrace/components';
import { ServiceInstrumentationService } from '../service-instrumentation.service';
import { HeuristicClassScoreInfo, HeuristicScoreInfo } from '../service-instrumentation.types';

@Component({
  styleUrls: ['./instrumentation-details.component.scss'],
  selector: 'ht-service-instrumentation-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="service-instrumentation-details">
      <div class="button-container">
        <ht-button
          label="← Back to overview"
          role="${ButtonRole.Primary}"
          display="${ButtonStyle.PlainText}"
          (click)="this.onClickBack()"
        ></ht-button>
      </div>
      <h4>{{ this.heuristicClassScore?.name }}</h4>
      <p class="description">{{ this.heuristicClassScore?.description }}</p>

      <h5>Checks</h5>

      <mat-accordion class="heuristics">
        <mat-expansion-panel *ngFor="let heuristicScore of this.heuristicClassScore?.heuristicScoreInfo">
          <mat-expansion-panel-header>
            <mat-panel-title class="header-title">
              <ht-icon
                class="status-icon"
                [icon]="this.getHeaderIcon(heuristicScore.score)"
                [color]="this.getIconColor(heuristicScore.score)"
              ></ht-icon
              >{{ heuristicScore.name }}
            </mat-panel-title>
            <mat-panel-description> {{ this.getHeaderSummary(heuristicScore) }} </mat-panel-description>
          </mat-expansion-panel-header>
          <ht-service-instrumentation-panel-content
            [heuristicScore]="heuristicScore"
          ></ht-service-instrumentation-panel-content>
        </mat-expansion-panel>
      </mat-accordion>
    </div>
  `
})
export class InstrumentationDetailsComponent {
  public heuristicClassScore: HeuristicClassScoreInfo | undefined;

  public constructor(
    private readonly serviceInstrumentationService: ServiceInstrumentationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.route.url.subscribe(url => {
      this.serviceInstrumentationService.serviceScoreSubject.subscribe(serviceScore => {
        this.heuristicClassScore = serviceScore?.heuristicClassScoreInfo.find(
          category => category.name.toLowerCase() === url[0].path
        );
      });
    });
  }

  public onClickBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  public getHeaderIcon(score: number): string {
    if (score < 50 && score > -1) {
      return IconType.Close;
    }

    if (score < 70 && score > -1) {
      return IconType.Warning;
    }

    return IconType.Checkmark;
  }

  public getIconColor(score: number): string {
    if (score < 0) {
      return '#b7bfc2'; // $gray-3
    }

    return this.serviceInstrumentationService.getColorForScore(score).dark;
  }

  public getHeaderSummary(heuristicScore: HeuristicScoreInfo): string {
    if (heuristicScore.score < 0) {
      return 'This check was skipped as no eligible spans were present in the last evaluation';
    }

    if (heuristicScore.failureCount === '0') {
      return 'All spans passed this check';
    }

    const sampleSize = Number(heuristicScore.sampleSize);
    const failureCount = Number(heuristicScore.failureCount);
    const percentFailed = Math.min(Math.ceil((failureCount / sampleSize) * 100), 100);

    return `~${percentFailed}% of ${heuristicScore.sampleType}s failed this check`;
  }
}
