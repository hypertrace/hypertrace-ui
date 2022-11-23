import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { TimeRange } from '../public-api';

import { Observable, of } from 'rxjs';

import { isNil } from 'lodash-es';
import { tap } from 'rxjs/operators';
import { DeploymentsResponse } from './deployment.types';

import { SessionStorage } from '../utilities/browser/storage/session-storage';

interface TokenOptions {
  uri: string;
}

export const DEPLOYMENT_SERVICE_OPTIONS = new InjectionToken<TokenOptions>('DEPLOYMENT_SERVICE_OPTIONS');

@Injectable({ providedIn: 'root' })
export class DeploymentsService {
  public BASE_URL: string;
  public ENDPOINT: string = '/v1/deploy/';
  public DEPLOYMENTS_STORAGE_KEY_PREFIX: string = 'deployments';

  public constructor(
    private readonly http: HttpClient,
    private readonly sessionStorage: SessionStorage,
    @Inject(DEPLOYMENT_SERVICE_OPTIONS) injectedOptions: TokenOptions
  ) {
    this.BASE_URL = injectedOptions.uri;
  }

  private getCacheKey(serviceName: string, timeRange: TimeRange): string {
    return `${
      this.DEPLOYMENTS_STORAGE_KEY_PREFIX
    }-${serviceName}:${timeRange.startTime.getTime()}-${timeRange.endTime.getTime()}`;
  }

  public getAllServiceDeployments(serviceName: string, timeRange: TimeRange): Observable<DeploymentsResponse> {
    const cacheResult = this.sessionStorage.get(this.getCacheKey(serviceName, timeRange));
    if (cacheResult !== undefined) {
      return of(JSON.parse(cacheResult));
    }

    const params = new HttpParams().appendAll({
      service: serviceName,
      startTime: timeRange.startTime.getTime(),
      endTime: timeRange.endTime.getTime()
    });

    return this.http
      .get<DeploymentsResponse>(`${this.BASE_URL}${this.ENDPOINT}`, {
        params: params
      })
      .pipe(
        tap(data => {
          if (!isNil(data)) {
            this.sessionStorage.set(this.getCacheKey(serviceName, timeRange), JSON.stringify(data));
          }
        })
      );
  }
}
