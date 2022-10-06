import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { InMemoryStorage } from '../utilities/browser/storage/in-memory-storage';

export const INSTRUMENTATION_QUALITY_OPTIONS = new InjectionToken<TokenOptions>('INSTRUMENTATION_QUALITY_OPTIONS');

@Injectable({
  providedIn: 'root'
})
export class InstrumentationQualityService {
  public BASE_URL: string;
  public ORG_STORAGE_KEY: string = 'qoi-org-score';

  public constructor(
    private readonly http: HttpClient,
    private readonly inMemoryStorage: InMemoryStorage,
    @Inject(INSTRUMENTATION_QUALITY_OPTIONS) tokenOptions: TokenOptions
  ) {
    this.BASE_URL = `${tokenOptions.uri}/v1/score`;
  }

  public getServiceScore<T>(serviceName: string): Observable<T> {
    return this.http.get<T>(this.BASE_URL + serviceName);
  }

  public getOrgScore<T>(): Observable<T> {
    const cache = this.inMemoryStorage.get(this.ORG_STORAGE_KEY);

    if (cache !== undefined) {
      return of(JSON.parse(cache));
    }

    return this.http
      .get<T>(this.BASE_URL)
      .pipe(tap(data => this.inMemoryStorage.set(this.ORG_STORAGE_KEY, JSON.stringify(data))));
  }
}

interface TokenOptions {
  uri: string;
}
