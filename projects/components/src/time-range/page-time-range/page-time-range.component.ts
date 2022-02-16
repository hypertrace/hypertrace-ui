import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { NavigationService, PageTimeRangeService, TimeRange } from '@hypertrace/common';
import { isNil } from 'lodash-es';

@Component({
  selector: 'ht-page-time-range',
  template: ` <ht-time-range (timeRangeSelected)="this.onTimeRangeSelected($event)"></ht-time-range> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageTimeRangeComponent {
  public constructor(
    private readonly pageTimeRangeService: PageTimeRangeService,
    private readonly navigationService: NavigationService
  ) {}

  public onTimeRangeSelected(selectedTimeRange: TimeRange): void {
    const activatedRoute = this.navigationService.getCurrentActivatedRoute();
    const urlSegments: UrlSegment[] = activatedRoute.pathFromRoot.flatMap(activeRoute => activeRoute.snapshot.url);

    if (urlSegments.length === 1 && this.shouldSavePageTimeRange(activatedRoute)) {
      this.savePageTimeRange(selectedTimeRange, urlSegments[0]);
    }
  }

  public shouldSavePageTimeRange(route: ActivatedRoute): boolean {
    return !isNil(route.snapshot.data?.defaultTimeRange);
  }

  public savePageTimeRange(selectedTimeRange: TimeRange, segment: UrlSegment): void {
    if (!isNil(segment.path)) {
      this.pageTimeRangeService.setPageTimeRange(segment.path, selectedTimeRange);
    } else {
      throw Error('No segment provided to set page time range');
    }
  }
}
