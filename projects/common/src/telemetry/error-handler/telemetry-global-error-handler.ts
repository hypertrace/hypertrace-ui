import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { UserTelemetryInternalService } from '../user-telemetry-internal.service';

@Injectable()
export class TelemetryGlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  public handleError(error: Error) {
    const telemetryService = this.injector.get(UserTelemetryInternalService);

    const location = this.injector.get(LocationStrategy);
    const message = error.message ? error.message : error.toString();
    const url = location instanceof PathLocationStrategy ? location.path() : '';

    telemetryService.trackErrorEvent(message, { message, url, stack: error.stack, name: error.name, isError: true });

    throw error;
  }
}
