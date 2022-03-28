import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { LoggerService, NavigationService, PageTimeRangePreferenceService, TimeRange } from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { PopoverRelativePositionLocation } from '../popover/popover';

@Component({
  selector: 'ht-page-time-range',
  template: `
    <ht-time-range
      [dropdownLocationPreference]="this.dropdownLocationPreference"
      (timeRangeSelected)="this.onTimeRangeSelected($event)"
    ></ht-time-range>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageTimeRangeComponent {
  public readonly dropdownLocationPreference: PopoverRelativePositionLocation[] = [
    PopoverRelativePositionLocation.BelowRightAligned
  ];

  public constructor(
    private readonly pageTimeRangePreferenceService: PageTimeRangePreferenceService,
    private readonly navigationService: NavigationService,
    private readonly loggerService: LoggerService
  ) {}

  public onTimeRangeSelected(selectedTimeRange: TimeRange): void {
    const activatedRoute = this.navigationService.getCurrentActivatedRoute();
    const urlSegments: UrlSegment[] = activatedRoute.pathFromRoot.flatMap(activeRoute => activeRoute.snapshot.url);

    if (this.shouldSavePageTimeRange(activatedRoute)) {
      this.savePageTimeRange(selectedTimeRange, urlSegments[0]);
    }
  }

  public shouldSavePageTimeRange(currentRoute: ActivatedRoute): boolean {
    return !isNil(currentRoute.snapshot.data?.defaultTimeRange);
  }

  public savePageTimeRange(selectedTimeRange: TimeRange, segment: UrlSegment): void {
    if (!isNil(segment.path)) {
      this.pageTimeRangePreferenceService.setTimeRangePreferenceForPage(segment.path, selectedTimeRange);
    } else {
      this.loggerService.warn(`Unable to set time range. Invalid page.`);
    }
  }
}
