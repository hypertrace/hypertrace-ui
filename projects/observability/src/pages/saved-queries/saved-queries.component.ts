import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';

import { IconType } from '@hypertrace/assets-library';
import { NavigationParams, PreferenceService, SubscriptionLifecycle } from '@hypertrace/common';
import { DrilldownFilter, ExplorerService } from '../explorer/explorer-service';
import { SavedQuery } from '../explorer/explorer.component';

@Component({
  styleUrls: ['./saved-queries.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle],
  template: `
    <div class="saved-queries">
      <ht-page-header></ht-page-header>
      <div class="query-list-container">
        <div class="query-container" *ngFor="let query of savedQueries; let queryIndex = index">
          <div class="query-link-container">
            <ht-link [paramsOrUrl]="getExplorerNavigationParams$(query) | async">
              <div class="query-link">
                <div class="name-container">
                  <p class="query-name">{{ query.name }}</p>
                  <p class="scope">{{ query.scopeQueryParam === 'spans' ? 'Spans' : 'Endpoint Traces' }}</p>
                </div>
                <div class="filters-container">
                  <span *ngFor="let filter of query.filters">{{ filter.userString }}</span>
                </div>
              </div>
            </ht-link>
          </div>
          <div class="query-options-container">
            <ht-icon
              title="Rename"
              class="query-option-edit"
              icon="${IconType.Edit}"
              (click)="onRename(queryIndex)"
            ></ht-icon>
            <ht-icon
              title="Delete"
              class="query-option-delete"
              icon="${IconType.Delete}"
              (click)="onDelete(queryIndex)"
            ></ht-icon>
          </div>
        </div>
      </div>
      <p class="not-found-text" *ngIf="savedQueries.length === 0">
        You haven't saved any queries! Go to Explorer page to save a query.
      </p>
    </div>
  `
})
export class SavedQueriesComponent {
  public savedQueries: SavedQuery[] = [];

  public constructor(
    private readonly preferenceService: PreferenceService,
    private readonly explorerService: ExplorerService,
    private readonly subscriptionLifecycle: SubscriptionLifecycle
  ) {
    this.subscriptionLifecycle.add(
      this.preferenceService.get('savedQueries', []).subscribe((queries: SavedQuery[]) => {
        this.savedQueries = queries;
      })
    );
  }

  public getExplorerNavigationParams$(query: SavedQuery): Observable<NavigationParams> {
    return this.explorerService.buildNavParamsWithFilters(query.scopeQueryParam, query.filters as DrilldownFilter[]);
  }

  public onRename(index: number): void {
    let queryName: string | null = this.savedQueries[index].name;
    queryName = prompt('Enter a new name for this query', queryName);

    if (queryName !== null) {
      this.preferenceService.set(
        'savedQueries',
        this.savedQueries.map((query, i) => (i === index ? { ...query, name: queryName } : query))
      );
    }
  }

  public onDelete(index: number): void {
    if (confirm('Are you sure you want to delete this query?')) {
      this.preferenceService.set(
        'savedQueries',
        this.savedQueries.filter((_, i) => i !== index)
      );
    }
  }
}
