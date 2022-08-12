import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { IconType } from '@hypertrace/assets-library';
import { NavigationParams, SubscriptionLifecycle, UserPreferenceService } from '@hypertrace/common';
import { DrilldownFilter, ExplorerService } from '../explorer/explorer-service';
import { SavedQueriesService, SavedQuery, SavedQueryPayload } from './saved-queries.service';

@Component({
  styleUrls: ['./saved-queries.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle, SavedQueriesService],
  template: `
    <div class="saved-queries">
      <ht-page-header></ht-page-header>
      <div class="query-list-container">
        <div class="query-container" *ngFor="let query of savedQueriesSubject | async">
          <div class="query-link-container">
            <ht-link [paramsOrUrl]="getExplorerNavigationParams$(query.data) | async">
              <div class="query-link">
                <div class="name-container">
                  <p class="query-name">{{ query.data.name }}</p>
                  <p class="scope">{{ query.data.scopeQueryParam === 'spans' ? 'Spans' : 'Endpoint Traces' }}</p>
                </div>
                <div class="filters-container">
                  <span *ngFor="let filter of query.data.filters">{{ filter.userString }}</span>
                </div>
              </div>
            </ht-link>
          </div>
          <div class="query-options-container">
            <ht-icon
              title="Rename"
              class="query-option-edit"
              icon="${IconType.Edit}"
              (click)="onRename(query.id)"
            ></ht-icon>
            <ht-icon
              title="Delete"
              class="query-option-delete"
              icon="${IconType.Delete}"
              (click)="onDelete(query.id)"
            ></ht-icon>
          </div>
        </div>
      </div>
      <p class="not-found-text" *ngIf="(savedQueriesSubject | async)?.length === 0">
        You haven't saved any queries! Go to Explorer page to save a query.
      </p>
    </div>
  `
})
export class SavedQueriesComponent implements OnInit {
  public savedQueriesSubject: BehaviorSubject<SavedQueryPayload[]> = new BehaviorSubject<SavedQueryPayload[]>([]);

  public constructor(
    private readonly explorerService: ExplorerService,
    private readonly subscriptionLifecycle: SubscriptionLifecycle,
    private readonly savedQueriesService: SavedQueriesService,
    private readonly userPreferenceService: UserPreferenceService
  ) {}

  public ngOnInit(): void {
    // Todo: Remove this after some time. See method definition for details.
    this.savedQueriesService.moveOldQueries();

    this.subscriptionLifecycle.add(
      this.userPreferenceService.hasLoaded.subscribe(hasLoaded => {
        if (hasLoaded) {
          this.subscriptionLifecycle.add(
            this.savedQueriesService.getAllQueries().subscribe((queries: SavedQueryPayload[]) => {
              this.savedQueriesSubject.next(queries);
            })
          );
        }
      })
    );
  }

  public getExplorerNavigationParams$(query: SavedQuery): Observable<NavigationParams> {
    return this.explorerService.buildNavParamsWithFilters(query.scopeQueryParam, query.filters as DrilldownFilter[]);
  }

  public onRename(queryId: number): void {
    const query: SavedQueryPayload = this.savedQueriesSubject.getValue().find(savedQuery => savedQuery.id === queryId)!;
    const queryData: SavedQuery = query.data;
    const queryName = prompt('Enter a new name for this query', queryData.name);
    if (queryName !== null) {
      queryData.name = queryName;
      this.subscriptionLifecycle.add(this.savedQueriesService.updateQueryById(queryId, queryData).subscribe());
    }
  }

  public onDelete(queryId: number): void {
    if (confirm('Are you sure you want to delete this query?')) {
      this.subscriptionLifecycle.add(
        this.savedQueriesService.deleteQueryById(queryId).subscribe(response => {
          if (response.success) {
            this.savedQueriesSubject.next(
              this.savedQueriesSubject.getValue().filter((savedQuery: SavedQueryPayload) => savedQuery.id !== queryId)
            );
          }
        })
      );
    }
  }
}
