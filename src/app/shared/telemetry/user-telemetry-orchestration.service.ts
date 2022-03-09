import { Injectable } from '@angular/core';
import { UserTelemetryService } from '@hypertrace/common';

@Injectable({
  providedIn: 'root'
})
export class UserTelemetryOrchestrationService {
  public constructor(private readonly userTelemetryService: UserTelemetryService) {}

  public initialize(): void {
    this.userTelemetryService.initialize();

    /**
     * To Identify user or keep it anonymous, please call this.userTelemetryService.identify()
     * to identify the user.
     */
  }
}
