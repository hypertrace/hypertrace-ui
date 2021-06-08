import { Injectable } from '@angular/core';
import { Dictionary, NavigationParams, NavigationParamsType, NavigationService } from '@hypertrace/common';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TracingNavigationService {
  public constructor(private readonly navigationService: NavigationService) {}

  public navigateToTraceDetail(traceId: string, spanId?: string, startTime?: string | number): Observable<boolean> {
    return this.navigationService.navigate(this.buildTraceDetailNavigationParam(traceId, spanId, startTime));
  }

  public buildTraceDetailNavigationParam(
    traceId: string,
    spanId?: string,
    startTime?: string | number
  ): NavigationParams {
    const optionalParams: Dictionary<string> = {};

    if (startTime !== undefined) {
      optionalParams.startTime = `${String(startTime)}`;
    }

    if (spanId !== undefined) {
      optionalParams.spanId = spanId;
    }

    return {
      navType: NavigationParamsType.InApp,
      path: ['/trace', traceId, optionalParams]
    };
  }

  public navigateToApiTraceDetail(traceId: string, startTime?: string | number): Observable<boolean> {
    return this.navigationService.navigate(this.buildApiTraceDetailNavigationParam(traceId, startTime));
  }

  public buildApiTraceDetailNavigationParam(traceId: string, startTime?: string | number): NavigationParams {
    const optionalParams: Dictionary<string> = {};

    if (startTime !== undefined) {
      optionalParams.startTime = `${String(startTime)}`;
    }

    return {
      navType: NavigationParamsType.InApp,
      path: ['/api-trace', traceId, optionalParams]
    };
  }
}
