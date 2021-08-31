import { Injectable } from '@angular/core';
import { UserTraits } from './telemetry';
import { UserTelemetryInternalService } from './user-telemetry-internal.service';

@Injectable({ providedIn: 'root' })
export class UserTelemetryService2 {
  public constructor(private readonly userTelemetryInternalService: UserTelemetryInternalService) {}

  public initialize(): void {
    this.userTelemetryInternalService.initialize();
  }

  public identify(userTraits: UserTraits): void {
    this.userTelemetryInternalService.identify(userTraits);
  }

  public shutdown(): void {
    this.userTelemetryInternalService.shutdown();
  }
}
