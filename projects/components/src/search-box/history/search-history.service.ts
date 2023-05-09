import { Injectable } from '@angular/core';
import { PreferenceService, StorageType } from '@hypertrace/common';
import { isEmpty } from 'lodash-es';
import { EMPTY, Observable } from 'rxjs';
import { mapTo, take, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SearchHistoryService {
  private readonly storage: StorageType = StorageType.Session;

  public constructor(private readonly preferenceService: PreferenceService) {}

  public getSearchHistory(preferenceKey: string): Observable<string[]> {
    return this.getPreferences(preferenceKey);
  }

  public addToSearchHistory(preferenceKey: string, text: string): Observable<boolean> {
    if (isEmpty(text)) {
      return EMPTY;
    }

    return this.getPreferences(preferenceKey).pipe(
      take(1),
      tap(texts => this.setPreferences(preferenceKey, [text, ...texts].slice(0, 100))),
      mapTo(true)
    );
  }

  private setPreferences(preferenceKey: string, texts: string[]): void {
    this.preferenceService.set(preferenceKey, texts, this.storage);
  }

  private getPreferences(preferenceKey: string): Observable<string[]> {
    return this.preferenceService.get<string[]>(preferenceKey, [], this.storage);
  }
}
