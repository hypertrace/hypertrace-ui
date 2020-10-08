import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { NavigationParams, NavigationPath, NavigationService } from '@hypertrace/common';

@Component({
  selector: 'ht-link',
  styleUrls: ['./link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      *ngIf="this.navigationPath"
      class="ht-link"
      [routerLink]="this.navigationPath"
      [queryParams]="this.navigationOptions?.queryParams"
      [queryParamsHandling]="this.navigationOptions?.queryParamsHandling"
      [skipLocationChange]="this.navigationOptions?.skipLocationChange"
      [replaceUrl]="this.navigationOptions?.replaceUrl"
    >
      <ng-content></ng-content>
    </a>
  `
})
export class LinkComponent implements OnChanges {
  @Input()
  public paramsOrUrl?: NavigationParams | string;

  public navigationPath?: NavigationPath;
  public navigationOptions?: NavigationExtras;

  public constructor(private readonly navigationService: NavigationService) {}

  public ngOnChanges(): void {
    this.setNavigationParams();
  }

  private setNavigationParams(): void {
    if (this.paramsOrUrl !== undefined) {
      const { path, extras } = this.navigationService.buildNavigationParams(this.paramsOrUrl);
      this.navigationPath = path;
      this.navigationOptions = extras;
    }
  }
}
