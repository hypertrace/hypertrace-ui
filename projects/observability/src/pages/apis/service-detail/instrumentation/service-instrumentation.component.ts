import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { BreadcrumbsService } from '@hypertrace/components';
import { ServiceInstrumentationService } from './service-instrumentation.service';
import { ServiceScoreResponse } from './service-instrumentation.types';

@Component({
  styleUrls: ['./service-instrumentation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ServiceInstrumentationService],
  template: `
    <main class="service-instrumentation" *ngIf="this.getServiceScore() | async; else loader">
      <ng-container *ngIf="(this.getServiceScore() | async)?.heuristicClassScoreInfo.length > 0; else noData">
        <router-outlet></router-outlet>
      </ng-container>

      <ng-template #noData>
        Quality evaluation has not been done yet for this service. Please check back later.
      </ng-template>
    </main>

    <ng-template #loader> <ht-loader></ht-loader></ng-template>
  `
})
export class ServiceInstrumentationComponent implements OnInit {
  public constructor(
    private readonly breadcrumbsService: BreadcrumbsService,
    private readonly serviceInstrumentationService: ServiceInstrumentationService
  ) {}

  public ngOnInit(): void {
    this.breadcrumbsService.getLastBreadCrumbString().subscribe(serviceName => {
      this.serviceInstrumentationService
        .getServiceScore(serviceName)
        .subscribe(serviceScore => this.serviceInstrumentationService.serviceScoreSubject.next(serviceScore));
    });
  }

  public getServiceScore(): BehaviorSubject<ServiceScoreResponse | undefined> {
    return this.serviceInstrumentationService.serviceScoreSubject;
  }
}
