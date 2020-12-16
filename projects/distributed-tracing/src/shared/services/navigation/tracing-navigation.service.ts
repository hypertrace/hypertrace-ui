import { Injectable } from '@angular/core';
import { Dictionary, NavigationService } from '@hypertrace/common';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TracingNavigationService {
  public constructor(private readonly navigationService: NavigationService) {}

  public navigateToTraceDetail(traceId: string, spanId?: string, startTime?: unknown): Observable<boolean> {
    const optionalParams: Dictionary<string> = {};

    if (startTime !== undefined) {
      optionalParams.startTime = `${String(startTime)}`;
    }

    if (spanId !== undefined) {
      optionalParams.spanId = spanId;
    }

    return this.navigationService.navigateWithinApp(['trace', traceId, optionalParams]);
  }

  public navigateToApiTraceDetail(traceId: string, startTime?: unknown): Observable<boolean> {
    const optionalParams: Dictionary<string> = {};

    if (startTime !== undefined) {
      optionalParams.startTime = `${String(startTime)}`;
    }

    return this.navigationService.navigateWithinApp(['api-trace', traceId, optionalParams]);
  }
}
