import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { NavigationService, TimeRange, UserSpecifiedTimeRangeService } from '@hypertrace/common';
import { isNil } from 'lodash-es';

@Component({
  selector: 'ht-user-specified-time-range-selector',
  template: ` <ht-time-range (timeRangeSelected)="this.onTimeRangeSelected($event)"></ht-time-range> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSpecifiedTimeRangeSelectorComponent {
  public constructor(
    private readonly userSpecifiedTimeRangeService: UserSpecifiedTimeRangeService,
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
      this.userSpecifiedTimeRangeService.setUserSpecifiedTimeRangeForPage(segment.path, selectedTimeRange);
    } else {
      throw Error('No segment provided to set page time range');
    }
  }
}
