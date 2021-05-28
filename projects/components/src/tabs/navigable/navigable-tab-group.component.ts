import { AfterContentInit, ChangeDetectionStrategy, Component, ContentChildren, QueryList } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FeatureState, NavigationService } from '@hypertrace/common';
import { merge, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { NavigableTabComponent } from './navigable-tab.component';

@Component({
  selector: 'ht-navigable-tab-group',
  styleUrls: ['./navigable-tab-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tab-group">
      <nav mat-tab-nav-bar *htLetAsync="this.activeTab$ as activeTab" disableRipple>
        <ng-container *ngFor="let tab of this.tabs">
          <ng-container *ngIf="!tab.hidden">
            <div class="tab-button" *htIfFeature="tab.featureFlags | htFeature as featureState">
              <a mat-tab-link (click)="this.onTabClick(tab)" class="tab-link" [active]="activeTab === tab">
                <ng-container *ngTemplateOutlet="tab.content"></ng-container>
                <span *ngIf="featureState === '${FeatureState.Preview}'" class="soon-container">
                  <span class="soon">SOON</span>
                </span>
              </a>
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
  public tabs!: QueryList<NavigableTabComponent>;

  public activeTab$?: Observable<NavigableTabComponent | undefined>;

  public constructor(
    public readonly navigationService: NavigationService,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  public ngAfterContentInit(): void {
    this.activeTab$ = merge(this.navigationService.navigation$, this.tabs.changes).pipe(
      startWith(undefined),
      map(() => this.findActiveTab())
    );
  }

  public onTabClick(tab: NavigableTabComponent): void {
    this.navigationService.navigateWithinApp([tab.path], this.activatedRoute, [], tab.replaceHistory);
  }

  private findActiveTab(): NavigableTabComponent | undefined {
    return this.tabs.find(tab => this.navigationService.isRelativePathActive([tab.path], this.activatedRoute));
  }
}
