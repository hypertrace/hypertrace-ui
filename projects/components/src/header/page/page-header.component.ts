import { ChangeDetectionStrategy, Component, ContentChild, Input, OnInit } from '@angular/core';
import {
  Breadcrumb,
  FeatureState,
  FeatureStateResolver,
  isNonEmptyString,
  NavigationService,
  PreferenceService,
  SubscriptionLifecycle
} from '@hypertrace/common';
import { Observable, of } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { BreadcrumbsService } from '../../breadcrumbs/breadcrumbs.service';
import { IconSize } from '../../icon/icon-size';
import { NavigableTab } from '../../tabs/navigable/navigable-tab';
import { HeaderPrimaryRowContentDirective } from '../header-content/header-primary-row-content.directive';
import { HeaderSecondaryRowContentDirective } from '../header-content/header-secondary-row-content.directive';

export const enum PageTimeRangeFeature {
  PageTimeRange = 'ui.page-time-range'
}
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
      <div class="column-alignment">
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
          <ht-time-range-for-page *ngIf="this.showPageTimeRange | async" class="time-range"></ht-time-range-for-page>
        </div>

        <ng-container [ngTemplateOutlet]="this.secondaryRowContent?.templateRef"></ng-container>
      </div>

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
  public readonly showPageTimeRange: Observable<boolean>;

  @Input()
  public persistenceId?: string;

  @Input()
  public tabs?: NavigableTab[] = [];

  @Input()
  public isBeta: boolean = false;

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
    protected readonly breadcrumbsService: BreadcrumbsService,
    protected readonly featureResolver: FeatureStateResolver
  ) {
    this.showPageTimeRange = this.featureResolver
      .getFeatureState(PageTimeRangeFeature.PageTimeRange)
      .pipe(map(featureState => featureState === FeatureState.Enabled));
  }

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
