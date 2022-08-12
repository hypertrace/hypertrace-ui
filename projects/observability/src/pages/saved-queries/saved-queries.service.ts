import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PreferenceService, SubscriptionLifecycle, UserPreferenceService } from '@hypertrace/common';
import { Filter } from '@hypertrace/components';
import { ScopeQueryParam } from '../explorer/explorer.types';

@Injectable()
export class SavedQueriesService {
  public constructor(
    private readonly subscriptionLifecycle: SubscriptionLifecycle,
    private readonly preferenceService: PreferenceService,
    private readonly userPreferenceService: UserPreferenceService
  ) {}

  public saveQuery(query: SavedQuery): Observable<SavedQueryResponse> {
    return this.userPreferenceService.post<SavedQueryResponse>('/v1/query/save', query);
  }

  public getAllQueries(): Observable<SavedQueryPayload[]> {
    return this.userPreferenceService
      .get<{ payload: SavedQueryPayload[] }>('/v1/query/all?sort=created_at&order=DESC')
      .pipe(map(response => response.payload));
  }

  public updateQueryById(queryId: number, queryData: SavedQuery): Observable<SavedQueryPayload> {
    return this.userPreferenceService
      .put<{ payload: SavedQueryPayload }>(`/v1/query/${queryId}`, queryData)
      .pipe(map(response => response.payload));
  }

  public deleteQueryById(queryId: number): Observable<SavedQueryResponse> {
    return this.userPreferenceService.delete(`/v1/query/${queryId}`);
  }

  /**
   * Todo: Temporary method to support transition from localStorage to backend service.
   * This removes old saved queries from localStorage and moves them to backend
   * storage. This method can be safely deleted around December 2022, assuming
   * 6 months is enough time for a user to visit the Hypertrace Explorer or Saved
   * Queries pages, which triggers this method. Reading from localStorage has a
   * performance impact so this method shouldn't be left in the code when it's
   * no longer needed.
   */
  public moveOldQueries(): void {
    this.subscriptionLifecycle.add(
      this.preferenceService.get('savedQueries', []).subscribe((queries: SavedQuery[]) => {
        if (queries.length > 0) {
          queries.forEach(query => this.subscriptionLifecycle.add(this.saveQuery(query).subscribe()));
          this.preferenceService.set('savedQueries', []);
        }
      })
    );
  }
}

export interface SavedQueryPayload {
  createdAt: number;
  data: SavedQuery;
  deletedAt: number;
  id: number;
  ownerID: number;
  updatedAt: number;
}

export interface SavedQuery {
  name: string;
  scopeQueryParam: ScopeQueryParam;
  filters: Filter[];
}

interface SavedQueryResponse {
  success: boolean;
}
