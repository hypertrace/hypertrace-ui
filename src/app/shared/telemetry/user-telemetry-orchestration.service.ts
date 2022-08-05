import { Injectable } from '@angular/core';
import { UserTelemetryService } from '@hypertrace/common';

import { CustomWindow } from '../../root.module';

declare const window: CustomWindow;

@Injectable({
  providedIn: 'root'
})
export class UserTelemetryOrchestrationService {
  public constructor(private readonly userTelemetryService: UserTelemetryService) {}

  public initialize(): void {
    if (window?.analyticsConfig?.enabled) {
      this.userTelemetryService.initialize();

      /**
       * To Identify user or keep it anonymous, please call this.userTelemetryService.identify()
       * to identify the user.
       */
      this.userTelemetryService.identify({});
    }
  }
}
