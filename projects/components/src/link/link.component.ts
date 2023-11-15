import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import {
  ExternalNavigationParams,
  ExternalNavigationWindowHandling,
  NavigationParams,
  NavigationParamsType,
  NavigationPath,
  NavigationService,
  assertUnreachable,
} from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { EMPTY, Observable } from 'rxjs';

@Component({
  selector: 'ht-link',
  styleUrls: ['./link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *htLetAsync="this.navData$ as navData">
      <ng-template #contentHolder>
        <ng-content></ng-content>
      </ng-template>

      <ng-container *ngIf="this.externalNavParams; else internalLinkTemplate">
        <a
          class="ht-link external"
          [ngClass]="{ disabled: this.disabled || !navData }"
          [attr.href]="this.externalNavParams.url"
          [attr.aria-label]="this.ariaLabel"
          (click)="this.onExternalLinkClick($event, this.externalNavParams)"
        >
          <ng-container *ngTemplateOutlet="contentHolder"></ng-container>
        </a>
      </ng-container>

      <ng-template #internalLinkTemplate>
        <a
          class="ht-link internal"
          [ngClass]="{ disabled: this.disabled || !navData }"
          [routerLink]="navData?.path"
          [queryParams]="navData?.extras?.queryParams"
          [queryParamsHandling]="navData?.extras?.queryParamsHandling"
          [skipLocationChange]="navData?.extras?.skipLocationChange"
          [replaceUrl]="navData?.extras?.replaceUrl"
          [htTrack]
          htTrackLabel="{{ navData && navData.path ? navData.path : '' }}"
          [attr.aria-label]="this.ariaLabel"
        >
          <ng-container *ngTemplateOutlet="contentHolder"></ng-container>
        </a>
      </ng-template>
    </ng-container>
  `,
})
export class LinkComponent implements OnChanges {
  @Input()
  public paramsOrUrl?: NavigationParams | string | null;

  @Input()
  public disabled?: boolean;

  @Input()
  public ariaLabel?: string;

  public navData$: Observable<NavData> = EMPTY;
  public isExternal: boolean = false;
  public externalNavParams?: ExternalNavigationParams;

  public constructor(private readonly navigationService: NavigationService) {}

  public ngOnChanges(): void {
    this.externalNavParams = this.checkAndBuildExternalNavParams();
    this.navData$ = isNil(this.paramsOrUrl) ? EMPTY : this.navigationService.buildNavigationParams$(this.paramsOrUrl);
  }

  public onExternalLinkClick(event: MouseEvent, externalNavParams: ExternalNavigationParams): void {
    event.preventDefault();
    window.open(externalNavParams.url, this.asWindowName(externalNavParams.windowHandling));
  }

  private asWindowName(windowHandling: ExternalNavigationWindowHandling): string | undefined {
    switch (windowHandling) {
      case ExternalNavigationWindowHandling.SameWindow:
        return '_self';
      case ExternalNavigationWindowHandling.NewWindow:
        return undefined;
      default:
        assertUnreachable(windowHandling);
    }
  }

  private checkAndBuildExternalNavParams(): ExternalNavigationParams | undefined {
    if (isNil(this.paramsOrUrl)) {
      return undefined;
    }

    if (typeof this.paramsOrUrl === 'string' && this.navigationService.isExternalUrl(this.paramsOrUrl)) {
      return {
        navType: NavigationParamsType.External,
        url: this.paramsOrUrl,
        windowHandling: ExternalNavigationWindowHandling.SameWindow,
      };
    }

    if (typeof this.paramsOrUrl !== 'string' && this.paramsOrUrl.navType === NavigationParamsType.External) {
      return {
        ...this.paramsOrUrl,
        url: this.paramsOrUrl.useGlobalParams
          ? this.navigationService.constructExternalUrl(this.paramsOrUrl.url)
          : this.paramsOrUrl.url,
      };
    }

    return undefined;
  }
}

interface NavData {
  path: NavigationPath;
  extras?: NavigationExtras;
}
