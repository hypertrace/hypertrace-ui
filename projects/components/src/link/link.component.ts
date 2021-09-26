import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { NavigationParams, NavigationPath, NavigationService } from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { EMPTY, Observable } from 'rxjs';

@Component({
  selector: 'ht-link',
  styleUrls: ['./link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      *htLetAsync="this.navData$ as navData"
      class="ht-link"
      [ngClass]="{ disabled: this.disabled || !navData }"
      [routerLink]="navData?.path"
      [queryParams]="navData?.extras?.queryParams"
      [queryParamsHandling]="navData?.extras?.queryParamsHandling"
      [skipLocationChange]="navData?.extras?.skipLocationChange"
      [replaceUrl]="navData?.extras?.replaceUrl"
      htTrack
      htTrackLabel="{{ navData && navData.path ? navData.path : '' }}"
    >
      <ng-content></ng-content>
    </a>
  `
})
export class LinkComponent implements OnChanges {
  @Input()
  public paramsOrUrl?: NavigationParams | string | null;

  @Input()
  public disabled?: boolean;

  public navData$: Observable<NavData> = EMPTY;

  public constructor(private readonly navigationService: NavigationService) {}

  public ngOnChanges(): void {
    this.navData$ = isNil(this.paramsOrUrl) ? EMPTY : this.navigationService.buildNavigationParams$(this.paramsOrUrl);
  }
}

interface NavData {
  path: NavigationPath;
  extras?: NavigationExtras;
}
