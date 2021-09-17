import { Injectable } from '@angular/core';
import { UserTraits } from './telemetry';
import { UserTelemetryInternalService } from './user-telemetry-internal.service';

@Injectable({ providedIn: 'root' })
export class UserTelemetryService {
  public constructor(private readonly userTelemetryInternalService: UserTelemetryInternalService) {}

  public initialize(userTraits: UserTraits): void {
    this.userTelemetryInternalService.initialize();
    this.userTelemetryInternalService.identify(userTraits);
  }

  public shutdown(): void {
    this.userTelemetryInternalService.shutdown();
  }
}
