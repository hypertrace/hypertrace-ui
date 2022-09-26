import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonRole, ButtonStyle } from '@hypertrace/components';
import { ServiceInstrumentationService } from '../service-instrumentation.service';
import { QoiTypeScore } from '../service-instrumentation.types';

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
      <h4>{{ this.categoryScore?.qoiType }}</h4>
      <p class="description">{{ this.categoryScore?.description }}</p>
    </div>
  `
})
export class InstrumentationDetailsComponent {
  public categoryScore: QoiTypeScore | undefined;

  public constructor(
    private readonly serviceInstrumentationService: ServiceInstrumentationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.route.url.subscribe(url => {
      this.serviceInstrumentationService.serviceScoreSubject.subscribe(serviceScore => {
        this.categoryScore = serviceScore?.qoiTypeScores.find(
          category => category.qoiType.toLowerCase() === url[0].path
        );
      });
    });
  }

  public onClickBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
