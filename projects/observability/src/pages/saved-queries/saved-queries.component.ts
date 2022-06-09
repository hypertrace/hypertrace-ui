import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';

import { NavigationParams, PreferenceService } from '@hypertrace/common';
import { DrilldownFilter, ExplorerService } from '../explorer/explorer-service';
import { SavedQuery } from '../explorer/explorer.component';

@Component({
  styleUrls: ['./saved-queries.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="saved-queries">
      <ht-page-header></ht-page-header>
      <div class="query-list-container">
        <ht-link
          *ngFor="let query of savedQueries$ | async"
          [paramsOrUrl]="getExplorerNavigationParams$(query) | async"
        >
          <div class="query-card">
            <div class="name-container">
              <p class="query-name">></p>
              <p class="scope">{{ query.scopeQueryParam === 'spans' ? 'Spans' : 'Endpoint Traces' }}</p>
            </div>
            <div class="filters-container">
              <span *ngFor="let filter of query.filters">{{ filter.userString }}</span>
            </div>
          </div>
        </ht-link>
      </div>
      <p class="not-found-text" *ngIf="(savedQueries$ | async)?.length === 0">
        You haven't saved any queries! Go to Explorer page to save a query.
      </p>
    </div>
  `
})
export class SavedQueriesComponent {
  public savedQueries$: Observable<SavedQuery[]>;

  public constructor(
    private readonly preferenceService: PreferenceService,
    private readonly explorerService: ExplorerService
  ) {
    this.savedQueries$ = this.preferenceService.get('savedQueries', []);
  }

  public getExplorerNavigationParams$(query: SavedQuery): Observable<NavigationParams> {
    return this.explorerService.buildNavParamsWithFilters(query.scopeQueryParam, query.filters as DrilldownFilter[]);
  }
}
