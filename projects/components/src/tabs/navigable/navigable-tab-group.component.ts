import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Output,
  QueryList
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Color,
  FeatureState,
  NavigationParams,
  NavigationParamsType,
  NavigationService,
  queryListAndChanges$
} from '@hypertrace/common';
import { merge, Observable } from 'rxjs';
import { distinctUntilChanged, map, startWith, tap } from 'rxjs/operators';
import { NavigableTabComponent } from './navigable-tab.component';

@Component({
  selector: 'ht-navigable-tab-group',
  styleUrls: ['./navigable-tab-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tab-group">
      <nav mat-tab-nav-bar *htLetAsync="this.activeTab$ as activeTab" disableRipple>
        <ng-container *ngFor="let tab of this.tabs$ | async">
          <ng-container *ngIf="!tab.hidden">
            <div class="tab-button" *htIfFeature="tab.featureFlags | htFeature as featureState">
              <ht-link
                mat-tab-link
                [active]="activeTab === tab"
                [paramsOrUrl]="buildNavParamsForTab | htMemoize: tab"
                class="tab-link"
              >
                <ng-container *ngTemplateOutlet="tab.content"></ng-container>
                <ng-container *ngIf="tab.labelTag">
                  <ht-label-tag
                    class="tab-label-tag"
                    [label]="tab.labelTag"
                    [backgroundColor]="this.getBackgroundColor(activeTab, tab)"
                    [labelColor]="this.getLabelColor(activeTab, tab)"
                  ></ht-label-tag>
                </ng-container>
                <span *ngIf="featureState === '${FeatureState.Preview}'" class="soon-container">
                  <span class="soon">SOON</span>
                </span>
              </ht-link>
              <div class="ink-bar" [ngClass]="{ active: activeTab === tab }"></div>
            </div>
          </ng-container>
        </ng-container>
      </nav>
      <div class="divider"></div>
    </div>
  `
})
export class NavigableTabGroupComponent implements AfterContentInit {
  @ContentChildren(NavigableTabComponent)
  private readonly tabs!: QueryList<NavigableTabComponent>;

  @Output()
  public readonly tabChange: EventEmitter<string | undefined> = new EventEmitter<string | undefined>();

  public activeTab$?: Observable<NavigableTabComponent | undefined>;
  public tabs$!: Observable<NavigableTabComponent[]>;

  public constructor(
    public readonly navigationService: NavigationService,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  public ngAfterContentInit(): void {
    this.tabs$ = queryListAndChanges$(this.tabs).pipe(map(list => list.toArray()));
    this.activeTab$ = merge(this.navigationService.navigation$, this.tabs.changes).pipe(
      startWith(undefined),
      map(() => this.findActiveTab()),
      distinctUntilChanged(),
      tap(activeTab => this.tabChange.emit(activeTab?.path))
    );
  }

  public buildNavParamsForTab = (tab: NavigableTabComponent): NavigationParams => ({
    navType: NavigationParamsType.InApp,
    path: tab.path,
    relativeTo: this.activatedRoute,
    replaceCurrentHistory: tab.replaceHistory
  });

  public getBackgroundColor(activeTab: NavigableTabComponent | undefined, tab: NavigableTabComponent): Color {
    return activeTab === tab ? Color.Gray9 : Color.Gray2;
  }

  public getLabelColor(activeTab: NavigableTabComponent | undefined, tab: NavigableTabComponent): Color {
    return activeTab === tab ? Color.White : Color.Gray5;
  }

  private findActiveTab(): NavigableTabComponent | undefined {
    return this.tabs.find(tab => this.navigationService.isRelativePathActive([tab.path], this.activatedRoute));
  }
}
