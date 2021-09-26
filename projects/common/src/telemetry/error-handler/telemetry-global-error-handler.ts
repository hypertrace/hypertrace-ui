import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { UserTelemetryImplService } from '../user-telemetry-impl.service';

@Injectable()
export class TelemetryGlobalErrorHandler implements ErrorHandler {
  public constructor(private readonly injector: Injector) {}

  public handleError(error: Error): Error {
    const telemetryService = this.injector.get(UserTelemetryImplService);

    const location = this.injector.get(LocationStrategy);
    const message = error.message ?? error.toString();
    const url = location instanceof PathLocationStrategy ? location.path() : '';

    telemetryService.trackErrorEvent(message, {
      message: message,
      url: url,
      stack: error.stack,
      name: error.name,
      isError: true
    });

    throw error;
  }
}
