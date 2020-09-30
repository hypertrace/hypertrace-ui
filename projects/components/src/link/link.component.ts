import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { NavigationPath, NavigationService } from '@hypertrace/common';
import { isEmpty } from 'lodash-es';

@Component({
  selector: 'ht-link',
  styleUrls: ['./link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      *ngIf="this.navigationParams"
      class="ht-link"
      [routerLink]="this.navigationParams[0]"
      [queryParams]="this.navigationParams[1].queryParams"
      [queryParamsHandling]="this.navigationParams[1].queryParamsHandling"
      [skipLocationChange]="this.navigationParams[1].skipLocationChange"
      [replaceUrl]="this.navigationParams[1].replaceUrl"
    >
      <ng-content></ng-content>
    </a>
  `
})
export class LinkComponent implements OnChanges {
  @Input()
  public url: string | undefined;

  public navigationParams?: [NavigationPath, NavigationExtras];

  public constructor(private readonly navigationService: NavigationService) {}

  public ngOnChanges(): void {
    this.setNavigationParams();
  }

  private setNavigationParams(): void {
    if (!isEmpty(this.url)) {
      this.navigationParams = this.navigationService.buildNavigationParams(this.url!);
    }
  }
}
