import { ChangeDetectionStrategy, Component, ContentChild, Input, OnInit } from '@angular/core';
import {
  Breadcrumb,
  isNonEmptyString,
  NavigationService,
  PreferenceService,
  SubscriptionLifecycle
} from '@hypertrace/common';
import { Observable, of } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { ApplicationFeature } from '../../../../../src/app/shared/constants/application-feature';
import { BreadcrumbsService } from '../../breadcrumbs/breadcrumbs.service';
import { IconSize } from '../../icon/icon-size';
import { NavigableTab } from '../../tabs/navigable/navigable-tab';
import { HeaderPrimaryRowContentDirective } from '../header-content/header-primary-row-content.directive';
import { HeaderSecondaryRowContentDirective } from '../header-content/header-secondary-row-content.directive';

@Component({
  selector: 'ht-page-header',
  styleUrls: ['./page-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle],
  template: `
    <div
      *ngIf="this.breadcrumbs$ | async as breadcrumbs"
      class="page-header"
      [class.bottom-border]="!this.tabs?.length"
    >
      <!-- If PageTimeRange feature flag is enabled, consumer of this component must specify the type of content being
           projected, primary or secondary -->
      <div
        *htIfFeature="'${ApplicationFeature.PageTimeRange}' | htFeature; else noTimeRangeHeaderLayoutTemplate"
        [ngClass]="this.contentAlignment"
      >
        <div class="primary-content">
          <div class="breadcrumb-container">
            <ht-breadcrumbs [breadcrumbs]="breadcrumbs"></ht-breadcrumbs>
            <div class="title" *ngIf="this.titlecrumb$ | async as titlecrumb">
              <ht-icon
                class="icon"
                *ngIf="titlecrumb.icon && breadcrumbs.length <= 1"
                [icon]="titlecrumb.icon"
                [label]="titlecrumb.label"
                size="${IconSize.Large}"
              ></ht-icon>

              <ht-label [label]="titlecrumb.label"></ht-label>
              <ht-beta-tag *ngIf="this.isBeta" class="beta"></ht-beta-tag>
            </div>
          </div>
          <ng-container *ngTemplateOutlet="this.primaryRowContent?.templateRef"></ng-container>
          <ht-user-specified-time-range-selector
            class="time-range"
            *htIfFeature="'${ApplicationFeature.NavigationRedesign}' | htFeature; else globalTimeRange"
          ></ht-user-specified-time-range-selector>

          <ng-template #globalTimeRange>
            <ht-time-range></ht-time-range>
          </ng-template>
        </div>

        <ng-container
          *ngIf="this.contentAlignment === '${PageHeaderContentAlignment.Column}'"
          [ngTemplateOutlet]="this.secondaryRowContent?.templateRef"
        ></ng-container>
      </div>

      <ng-template #noTimeRangeHeaderLayoutTemplate>
        <div [ngClass]="this.contentAlignment">
          <div class="breadcrumb-container">
            <ht-breadcrumbs [breadcrumbs]="breadcrumbs"></ht-breadcrumbs>
            <div class="title" *ngIf="this.titlecrumb$ | async as titlecrumb">
              <ht-icon
                class="icon"
                *ngIf="titlecrumb.icon && breadcrumbs.length <= 1"
                [icon]="titlecrumb.icon"
                [label]="titlecrumb.label"
                size="${IconSize.Large}"
              ></ht-icon>

              <ht-label [label]="titlecrumb.label"></ht-label>
              <ht-beta-tag *ngIf="this.isBeta" class="beta"></ht-beta-tag>
            </div>
          </div>

          <ng-content></ng-content>
        </div>
      </ng-template>

      <ht-navigable-tab-group *ngIf="this.tabs?.length" class="tabs" (tabChange)="this.onTabChange($event)">
        <ht-navigable-tab
          *ngFor="let tab of this.tabs"
          [path]="tab.path"
          [hidden]="tab.hidden"
          [features]="tab.features"
        >
          {{ tab.label }}
        </ht-navigable-tab>
      </ht-navigable-tab-group>
    </div>
  `
})
export class PageHeaderComponent implements OnInit {
  @Input()
  public persistenceId?: string;

  @Input()
  public tabs?: NavigableTab[] = [];

  @Input()
  public isBeta: boolean = false;

  /**
   * Alignment must be set to column (default) for secondaryRowContent projection,
   */
  @Input()
  public contentAlignment: PageHeaderContentAlignment = PageHeaderContentAlignment.Column;

  @ContentChild(HeaderPrimaryRowContentDirective)
  public readonly primaryRowContent?: HeaderPrimaryRowContentDirective;

  @ContentChild(HeaderSecondaryRowContentDirective)
  public readonly secondaryRowContent?: HeaderSecondaryRowContentDirective;

  public breadcrumbs$: Observable<Breadcrumb[] | undefined> = this.breadcrumbsService.breadcrumbs$.pipe(
    map(breadcrumbs => (breadcrumbs.length > 0 ? breadcrumbs : undefined))
  );

  public titlecrumb$: Observable<Breadcrumb | undefined> = this.breadcrumbsService.breadcrumbs$.pipe(
    map(breadcrumbs => (breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : {}))
  );

  public constructor(
    protected readonly navigationService: NavigationService,
    protected readonly preferenceService: PreferenceService,
    protected readonly subscriptionLifecycle: SubscriptionLifecycle,
    protected readonly breadcrumbsService: BreadcrumbsService
  ) {}

  public ngOnInit(): void {
    this.subscriptionLifecycle.add(
      this.getPreferences().subscribe(preferences => this.navigateIfPersistedActiveTab(preferences))
    );
  }

  private navigateIfPersistedActiveTab(preferences: PageHeaderPreferences): void {
    if (isNonEmptyString(this.persistenceId) && isNonEmptyString(preferences.selectedTabPath)) {
      this.navigationService.navigateWithinApp(
        preferences.selectedTabPath,
        this.navigationService.getCurrentActivatedRoute().parent!
      );
    }
  }

  public onTabChange(path?: string): void {
    this.setPreferences(path);
  }

  private getPreferences(): Observable<PageHeaderPreferences> {
    return isNonEmptyString(this.persistenceId)
      ? this.preferenceService.get<PageHeaderPreferences>(this.persistenceId, {}).pipe(first())
      : of({});
  }

  private setPreferences(selectedTabPath?: string): void {
    if (isNonEmptyString(this.persistenceId)) {
      this.preferenceService.set(this.persistenceId, {
        selectedTabPath: selectedTabPath
      });
    }
  }
}

interface PageHeaderPreferences {
  selectedTabPath?: string;
}

export const enum PageHeaderContentAlignment {
  Column = 'column-alignment',
  Row = 'row-alignment'
}
