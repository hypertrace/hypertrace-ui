import { Injectable } from '@angular/core';
import { FixedTimeRange, NavigationParamsType, NavigationService, TimeRangeService } from '@hypertrace/common';

@Injectable({
  providedIn: 'root'
})
export class CartesainExplorerNavigationService {
  public constructor(
    private readonly timeRangeService: TimeRangeService,
    private readonly navigationService: NavigationService
  ) {}

  public navigateToExplorer(start: Date, end: Date): void {
    this.timeRangeService.setFixedRange(start, end);
    const params = this.timeRangeService.toQueryParams(new FixedTimeRange(start, end));

    this.navigationService.navigate({
      navType: NavigationParamsType.InApp,
      path: ['/explorer'],
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceCurrentHistory: false
    });
  }
}
