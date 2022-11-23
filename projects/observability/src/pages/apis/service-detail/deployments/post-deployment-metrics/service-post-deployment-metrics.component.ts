import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FixedTimeRange, ReplayObservable, TimeRange } from '@hypertrace/common';
import { BreadcrumbsService } from '@hypertrace/components';
import { Dashboard, ModelJson } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NavigableDashboardFilterConfig } from '../../../../../public-api';
import { ServiceDetailService } from '../../service-detail.service';

import { postDeploymentMetricsJson } from './service-post-deployment-metrics.dashboard';

@Component({
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-navigable-dashboard
      *htLoadAsync="this.filterConfig$ as filterConfig"
      [defaultJson]="this.json"
      (dashboardReady)="this.onDashboardReady($event)"
      [filterConfig]="filterConfig"
      [navLocation]="null"
    >
    </ht-navigable-dashboard>
  `,
  selector: 'ht-service-post-deployment-metrics'
})
export class ServicePostDeploymentMetricsComponent implements OnChanges {
  public readonly filterConfig$: ReplayObservable<NavigableDashboardFilterConfig>;
  public dashboardRef: Dashboard | undefined = undefined;
  public constructor(
    private readonly breadCrumbsService: BreadcrumbsService,
    private readonly serviceDetailService: ServiceDetailService
  ) {
    this.serviceName = this.breadCrumbsService.getLastBreadCrumbString();
    this.json = postDeploymentMetricsJson;
    this.filterConfig$ = this.serviceDetailService.entityFilter$.pipe(
      map(filter => ({
        implicitFilters: [filter]
      }))
    );
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.startTime?.currentValue !== null || changes.endTime?.currentValue !== null) {
      const startTime = changes.startTime?.currentValue ?? this.startTime;
      const endTime = changes.endTime?.currentValue ?? this.endTime;
      this.dashboardRef?.setTimeRange(this.getFixedTimeRangeFromTime(startTime, endTime));
      this.dashboardRef?.refresh();
    }
  }

  public onDashboardReady(dashboard: Dashboard): void {
    this.dashboardRef = dashboard;
    this.dashboardRef.setTimeRange(this.getFixedTimeRangeFromTime(this.startTime, this.endTime));
  }

  public getFixedTimeRangeFromTime(startTime: number, endTime: number): TimeRange {
    return new FixedTimeRange(new Date(startTime), new Date(endTime));
  }

  public serviceName: Observable<string>;

  public json: ModelJson;

  @Input()
  public startTime!: number;

  @Input()
  public endTime!: number;
}
