import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Breadcrumb } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BreadcrumbsService } from '../../breadcrumbs/breadcrumbs.service';
import { IconSize } from '../../icon/icon-size';
import { NavigableTab } from '../../tabs/navigable/navigable-tab';

@Component({
  selector: 'htc-page-header',
  styleUrls: ['./page-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="this.breadcrumbs$ | async as breadcrumbs"
      class="page-header"
      [class.bottom-border]="!this.tabs?.length"
    >
      <div class="breadcrumb-container">
        <htc-breadcrumbs [breadcrumbs]="breadcrumbs"></htc-breadcrumbs>

        <div class="title" *ngIf="this.titlecrumb$ | async as titlecrumb">
          <htc-icon
            class="icon"
            *ngIf="titlecrumb.icon"
            [icon]="titlecrumb.icon"
            [label]="titlecrumb.label"
            size="${IconSize.Large}"
          ></htc-icon>

          <htc-label [label]="titlecrumb.label"></htc-label>
          <htc-beta-tag class="beta" *ngIf="this.isBeta"></htc-beta-tag>
        </div>
      </div>

      <ng-content></ng-content>

      <htc-navigable-tab-group *ngIf="this.tabs?.length" class="tabs">
        <htc-navigable-tab *ngFor="let tab of this.tabs" [path]="tab.path" [hidden]="tab.hidden">
          {{ tab.label }}
        </htc-navigable-tab>
      </htc-navigable-tab-group>
    </div>
  `
})
export class PageHeaderComponent {
  @Input()
  public tabs?: NavigableTab[] = [];

  @Input()
  public isBeta: boolean = false;

  public breadcrumbs$: Observable<Breadcrumb[] | undefined> = this.breadcrumbsService.breadcrumbs$.pipe(
    map(breadcrumbs => (breadcrumbs.length > 0 ? breadcrumbs : undefined))
  );

  public titlecrumb$: Observable<Breadcrumb | undefined> = this.breadcrumbsService.breadcrumbs$.pipe(
    map(breadcrumbs => (breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : {}))
  );

  public constructor(private readonly breadcrumbsService: BreadcrumbsService) {}
}
