import { Injectable } from '@angular/core';
import { NavigationParamsType, NavigationService, TimeRangeService } from '@hypertrace/common';

@Injectable({
  providedIn: 'root'
})
export class CartesainExplorerNavigationService {
  public constructor(
    private readonly timeRangeService: TimeRangeService,
    private readonly navigationService: NavigationService
  ) {}

  public navigateToExplorer(start: Date, end: Date): void {
    const params = this.timeRangeService.toQueryParams(start, end);

    this.navigationService.navigate({
      navType: NavigationParamsType.InApp,
      path: ['/explorer'],
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceCurrentHistory: false
    });
  }
}
